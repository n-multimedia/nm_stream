<template>
  <div id="stream" class="container">
    <stream-post-form
      :streamOptions="streamOptions"
      v-on:stream-post-added="addPost"
    />
    <transition-group name="list">
      <stream-post v-for="post in sortedPosts"
                   :key="post.nid"
                   :post="getLoadedPost(post)"
                   :comments="getNodeComments(post.nid)"
                   :streamOptions="streamOptions"
                   v-on:stream-post-deleted="deletePost"
                   v-on:stream-comment-added="addComment"
                   v-on:stream-user-added="addUser"
      />
    </transition-group>
  </div>
</template>

<script>
import Vue from 'vue'
import StreamPost from './components/StreamPost'
import StreamPostForm from './components/StreamPostForm'
import StreamComment from './components/StreamComment'
import ContentService from './services/ContentService'
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
      loggedInUser: 1,
      contentService: new ContentService()
    }
  },
  computed: {
    sortedPosts: function () {
      return Vue._.orderBy(this.posts, 'created', 'desc')
    }
  },
  methods: {
    initialize: function () {
      console.log('initialize')
      this.getPosts()
    },
    addPost: function (post) {
      this.posts.push(post)
    },
    deletePost: function (post) {
      let postListIndex = this.posts.indexOf(post)
      this.posts.splice(postListIndex, 1)
    },
    addComment: function (comment) {
      this.comments.push(comment)
    },
    addUser: function (user) {
      if (!this.getUser(user.uid)) {
        this.users.push(user)
      }
    },
    getPosts: function () {
      let self = this
      Vue.axios.get(this.$config.get('api.apiInitUrl'), {withCredentials: true}).then((response) => {
        self.posts = response.data.stream.posts
        self.users = response.data.stream.users
        self.comments = response.data.stream.comments
        self.streamOptions = new StreamOptions()
        self.streamOptions.privacyOptions = response.data.stream.privacyOptions
        self.streamOptions.privacyDefault = response.data.stream.privacyDefault
        self.streamOptions.loggedInUser = this.getUser(response.data.stream.loggedInUser)
        self.streamOptions.token = response.data.stream.token
        self.streamOptions.contextNID = response.data.stream.contextNID
        self.streamOptions.containerNID = response.data.stream.containerNID

        // this.$emit('content:updated', response.data.stream)
        // console.log(self.posts)
      })
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
  }
}
</script>

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

.card {
  padding: 1em;
  margin-bottom: 1em;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .2s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

/**
Flipping
 */
.card-flip {
  perspective: 100vw;
  &.flip-active .flip,
  &.flip-active .flip {
    transform: rotateY(180deg);
  }
}

.card-flip,
.front,
.back-delete,
.back-edit {
  width: 100%;
  // height: 480px;
}

.back-delete {
  button {
    margin-left: 10px;
  }
}

.flip {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

.front,
.back-delete,
.back-edit {
  backface-visibility: hidden;
  // position: absolute;
  // top: 0;
  // left: 0;
}

.back-delete,
.back-edit {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

.front {
  z-index: 2;
  transform: rotateY(0deg);
}

.back-delete,
.back-edit {
  transform: rotateY(180deg);
}
</style>
