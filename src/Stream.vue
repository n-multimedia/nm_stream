<template>
  <div id="stream" class="container">
    <stream-post-form
      :streamOptions="streamOptions">
    </stream-post-form>
    <transition-group name="list">
      <stream-post v-for="post in sortedPosts"
                   :key="post.nid"
                   :post="getLoadedPost(post)"
                   :comments="getNodeComments(post.nid)"
                   :streamOptions="streamOptions"/>
    </transition-group>
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
      loggedInUser: 1
    }
  },
  computed: {
    sortedPosts: function () {
      return this.posts.slice().sort((a, b) => {
        return a.created < b.created
      })
    }
  },
  methods: {
    initialize: function () {
      console.log('initialize')
      this.getPosts()
    },
    getPosts: function () {
      this.posts = require('./assets/jsonSample.json').posts
      this.users = require('./assets/jsonSample.json').users
      this.comments = require('./assets/jsonSample.json').comments
      this.streamOptions = new StreamOptions()
      this.streamOptions.privacyOptions = require('./assets/jsonSample.json').stream.privacyOptions
      this.streamOptions.privacyDefault = require('./assets/jsonSample.json').stream.privacyDefault
      this.streamOptions.loggedInUser = this.getUser(require('./assets/jsonSample.json').stream.loggedInUser)
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
.back {
  width: 100%;
  // height: 480px;
}

.flip {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

.front,
.back {
  backface-visibility: hidden;
  // position: absolute;
  // top: 0;
  // left: 0;
}

.back {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

.front {
  z-index: 2;
  transform: rotateY(0deg);
}

.back {
  transform: rotateY(180deg);
}
</style>
