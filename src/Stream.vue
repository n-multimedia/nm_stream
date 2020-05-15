<template>
  <div id="stream" class="container">
    <pulse-loader :loading="!initialized" :color="busyLoadingColor" :size="busyLoadingSize"></pulse-loader>
    <stream-post-form
      v-if="initialized && streamOptions.containerNID > 0 && streamOptions.permissions.canCreatePost"
      :streamOptions="streamOptions"
      :streamPlugins="streamPlugins"
      v-on:stream-post-added="addPost"
    />
    <div v-if="initialized && posts.length == 0">
      {{ $t('empty.no_posts_found') }}
    </div>
    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busyLoading" infinite-scroll-distance="10" v-keep-scroll-position class="stream-post-wrapper">
      <transition-group name="list">
        <stream-post v-for="post in sortedPosts"
                     :key="post.nid"
                     :post="getLoadedPost(post)"
                     :comments="getNodeComments(post.nid)"
                     :streamOptions="streamOptions"
                     v-on:stream-post-deleted="deletePost"
                     v-on:stream-comment-deleted="deleteComment"
                     v-on:stream-comment-added="addComment"
                     v-on:stream-user-added="addUser"
        />
      </transition-group>
    </div>
    <br />
    <pulse-loader :loading="busyLoadingMore" :color="busyLoadingColor" :size="busyLoadingSize"></pulse-loader>
    <br />
  </div>
</template>

<script>
import Vue from 'vue'
import StreamPost from './components/StreamPost'
import StreamPostForm from './components/StreamPostForm'
import StreamComment from './components/StreamComment'
import StreamOptions from './models/StreamOptions'

export default {
  name: 'stream',
  components: {StreamPostForm, StreamPost, StreamComment},
  data () {
    return {
      posts: [],
      streamOptions: [],
      comments: [],
      users: [],
      busyLoadingMore: false,
      busyLoadingColor: '#888',
      busyLoadingSize: '12px',
      maxPostsLimitReached: false,
      loggedInUser: 1,
      initialized: false,
      infiniteScrollLimit: 10,
      maxPostsToShow: 10,
      pollingUpdate: null,
      containerNid: null,
      streamUpdateOnRerender: false
    }
  },
  beforeMount: function () {
    if (this.$root.$el.attributes['data-container-nid']) {
      this.containerNid = this.$root.$el.attributes['data-container-nid'].value
    }
  },
  computed: {
    sortedPosts: function () {
      // sort by created and sticky
      let sortedPosts = Vue._.chain(this.posts).sortBy('created').sortBy('sticky').reverse().value()

      let slicedPosts = sortedPosts.slice(0, this.maxPostsToShow)
      return slicedPosts
    }
  },
  methods: {
    initialize: function () {
      this.initializeStream()
    },
    addPost: function (post) {
      this.posts.push(post)
      let eventUpdate = new Event('nm-stream:update-model')
      document.dispatchEvent(eventUpdate)
    },
    deletePost: function (post) {
      let postListIndex = this.posts.indexOf(post)
      this.posts.splice(postListIndex, 1)
      let eventUpdate = new Event('nm-stream:update-model')
      document.dispatchEvent(eventUpdate)
    },
    deleteComment: function (comment) {
      let commentListIndex = this.comments.indexOf(comment)
      this.comments.splice(commentListIndex, 1)
      let eventUpdate = new Event('nm-stream:update-model')
      document.dispatchEvent(eventUpdate)
    },
    addComment: function (comment) {
      this.comments.push(comment)
      let eventUpdate = new Event('nm-stream:update-model')
      document.dispatchEvent(eventUpdate)
    },
    addUser: function (user) {
      if (!this.getUser(user.uid)) {
        this.users.push(user)
      }
    },
    initializeStream: function () {
      let self = this
      Vue.axios.get(this.$config.get('api.apiInitUrl').replace('%node', this.containerNid), {withCredentials: true}).then((response) => {
        self.posts = response.data.stream.posts
        self.users = response.data.stream.users
        self.comments = response.data.stream.comments
        self.streamOptions = new StreamOptions()
        self.streamOptions.privacyOptions = response.data.stream.privacyOptions
        self.streamOptions.privacyOptionsAll = response.data.stream.privacyOptionsAll
        self.streamOptions.privacyDefault = response.data.stream.privacyDefault
        self.streamOptions.permissions = response.data.stream.permissions
        self.streamOptions.loggedInUser = this.getUser(response.data.stream.loggedInUser)
        self.streamOptions.token = response.data.stream.token
        self.streamOptions.contextNID = response.data.stream.contextNID
        self.streamOptions.containerNID = response.data.stream.containerNID
        self.streamOptions.timestamp = response.data.stream.timestamp
        self.streamOptions.acceptedFiles = response.data.stream.acceptedFiles

        self.streamPlugins = []

        self.initialized = true

        document.addEventListener('nm-stream:update-model', (e) => {
          this.streamUpdateOnRerender = true
        }, false)

        let eventUpdate = new Event('nm-stream:update-model')
        document.dispatchEvent(eventUpdate)

        // start polling
        self.pollUpdate()

        // this.$emit('content:updated', response.data.stream)
        // console.log(self.posts)
      })
    },
    loadMore: function () {
      // wait for initialization
      // do not poll if last poll is still loading
      // do not poll if there is no more new content coming
      if (!this.initialized || this.busyLoadingMore || this.maxPostsLimitReached) {
        return false
      }

      this.busyLoadingMore = true

      this.maxPostsToShow += this.infiniteScrollLimit

      this.pollUpdate()

      /*
      setTimeout(() => {
        this.busyLoadingMore = false
      }, 1000)
      */
    },
    getUser: function (uid) {
      return Vue._.find(this.users, ['uid', uid])
    },
    getNodeComments: function (nid) {
      let result = Vue._.filter(this.comments, ['nid', nid])
      if (result.length > 0) {
        for (let comment in result) {
          result[comment].user = this.getUser(result[comment].uid)
        }
      }
      return result
    },
    getLoadedPost (post) {
      post.user = this.getUser(post.uid)
      return post
    },
    pollUpdate () {
      let self = this

      clearInterval(this.pollingUpdate)

      this.pollingUpdate = setInterval(() => {
        if (!document.hasFocus()) {
          // do noting if tab has no focus
          return
        }

        let pollUpdateUrl = this.$config.get('api.apiPollUpdateUrl').replace('%node', this.streamOptions.containerNID).replace('%offset', 0).replace('%limit', self.maxPostsToShow).replace('%token', self.streamOptions.token)
        // get update data
        Vue.axios.get(pollUpdateUrl, {withCredentials: true}).then((response) => {
          if (self.busyLoadingMore) {
            self.maxPostsLimitReached = self.posts.length >= response.data.stream.posts.length
            self.busyLoadingMore = false
          }
          self.posts = response.data.stream.posts
          self.users = response.data.stream.users
          self.comments = response.data.stream.comments

          // self.mergeByProperty(self.posts, response.data.stream.posts, 'nid')
          // self.mergeByProperty(self.users, response.data.stream.users, 'nid')
          // self.mergeByProperty(self.comments, response.data.stream.comments, 'nid')

          self.streamOptions.timestamp = response.data.stream.timestamp

          let eventUpdate = new Event('nm-stream:update-model')
          document.dispatchEvent(eventUpdate)
        })
      }, 5000)
    },
    mergeByProperty (arr1, arr2, prop) {
      Vue._.each(arr2, function (arr2obj) {
        var arr1obj = Vue._.find(arr1, function (arr1obj) {
          return arr1obj[prop] === arr2obj[prop]
        })
        // If the object already exist extend it with the new values from arr2, otherwise just add the new object to arr1
        arr1obj ? Vue._.extend(arr1obj, arr2obj) : arr1.push(arr2obj)
      })
    }
  },
  updated: function () {
    if (this.streamUpdateOnRerender) {
      this.$nextTick(() => {
        // Code that will run only after the
        // entire view has been re-rendered
        let eventUpdate = new Event('nm-stream:update')
        document.dispatchEvent(eventUpdate)
        this.streamUpdateOnRerender = false
      })
    }
  },
  mounted: function () {
    this.initialize()
    window.addEventListener('dragover', function (e) {
      e = e || event
      e.preventDefault()
    }, false)
    window.addEventListener('drop', function (e) {
      e = e || event
      e.preventDefault()
    }, false)
  },
  beforeDestroy: function () {
    clearInterval(this.pollingUpdate)
  }
}
</script>

<style scoped lang="scss">
  /deep/ {
    @import "../node_modules/bootstrap/scss/_functions.scss";
    @import "../node_modules/bootstrap/scss/_variables.scss";
    //customize bootstrap to match okl
    @import "./assets/scss/bootstrap_custom.scss";
    @import "../node_modules/bootstrap/scss/bootstrap.scss";
    @import "../node_modules/bootstrap/scss/bootstrap-grid.scss";
    @import "../node_modules/bootstrap/scss/bootstrap-reboot.scss";
    @import "../node_modules/bootstrap/scss/card.scss";
    @import "../node_modules/bootstrap/scss/alert.scss";
    @import "../node_modules/bootstrap/scss/dropdown.scss";
    @import "../node_modules/bootstrap/scss/modal.scss";
    @import "../node_modules/bootstrap/scss/buttons.scss";
  }

</style>

<style lang="scss">
#stream {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  background-color: #efefef;
}

#stream .card {
  padding: 1em;
  margin-bottom: 1em;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
#stream .slide-fade-enter-active {
  transition: all .2s ease;
}
#stream .slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
#stream .slide-fade-enter, #stream .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

#stream .list-item {
  display: inline-block;
  margin-right: 10px;
}
#stream .list-enter-active, #stream .list-leave-active {
  transition: all 1s;
}
#stream .list-enter, #stream .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

/**
Flipping
 */
#stream .card-flip {
  perspective: 100vw;
  &.flip-active .flip,
  &.flip-active .flip {
    transform: rotateY(180deg);
  }
}

#stream .card-flip,
#stream .front,
#stream .back-delete,
#stream .back-edit {
  width: 100%;
  // height: 480px;
}

#stream .back-delete {
  button {
    margin-left: 10px;
  }
}

#stream .flip {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

#stream .front,
#stream .back-delete,
#stream .back-edit {
  backface-visibility: hidden;
  // position: absolute;
  // top: 0;
  // left: 0;
}

#stream .back-delete,
#stream .back-edit {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

#stream .front {
  z-index: 2;
  transform: rotateY(0deg);
}

#stream .back-delete,
#stream .back-edit {
  transform: rotateY(180deg);
}

#stream .stream-post-wrapper .v-spinner {
  position: absolute;
}
</style>
