<template>
  <div id="stream" class="container">
    <transition name="fade">
      <stream-filter v-if="initialized && !aggregated" :streamOptions="streamOptions"></stream-filter>
    </transition>
    <pulse-loader :loading="!initialized || getbusyLoading(containernid)" :color="busyLoadingColor"
                  :size="busyLoadingSize"></pulse-loader>
    <stream-post-form
        v-if="initialized && containernid > 0 && streamOptions.permissions.canCreatePost"
        :streamOptions="streamOptions"
        :mentionMembers="getMentionMembers(streamOptions.contextNID)"
        v-on:stream-post-added="addPost"
    />
    <div v-if="initialized && sortedPosts.length == 0">
      {{ $t('empty.no_posts_found') }}
    </div>
    <div v-if="initialized">
      <transition-group name="list">
        <stream-post v-for="post in sortedPosts"
                     :key="post.nid + post.changed"
                     :post="getPost(containernid, post.nid)"
                     :streamOptions="getStreamOptionsContainer(containernid)"
                     :mentionMembers="getMentionMembers(post.context.nid)"
        />
      </transition-group>
    </div>
    <!-- TODO reactive readmore link / infinite loop-->
    <br/>
    <div v-if="!aggregated && !getbusyLoadingMore(containernid)"
         v-waypoint="{ active: true, callback: onWaypointLoadMore, options: intersectionOptions }"></div>
    <pulse-loader :loading="!getbusyLoading(containernid) && getbusyLoadingMore(containernid)" :color="busyLoadingColor"
                  :size="busyLoadingSize"></pulse-loader>
    <br/>
    <div class="load-more-wrapper" v-if="!getMaxPostsLimitReached(containernid) && !getbusyLoadingMore(containernid)">
      <button @click="loadMore(containernid)">{{ $t('label.load_more') }}</button>
    </div>
  </div>
</template>

<script>
import StreamPost from './StreamPost'
import StreamPostForm from '../forms/StreamPostForm'
import {mapActions, mapGetters, mapState} from "vuex";
import StreamFilter from "@/components/widgets/StreamFilter";

export default {
  name: "StreamList",
  props: ['containernid', 'aggregated'],
  components: {
    StreamPost,
    StreamPostForm,
    StreamFilter,
  },
  data() {
    return {
      mentionMembers: [],
      busyLoadingColor: '#888',
      busyLoadingSize: '12px',
      loggedInUser: 1,
      infiniteScrollLimit: 10,
      maxPostsToShow: 10,
      pollingUpdate: null,
      streamUpdateOnRerender: false,
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: [0, 1] // [0.25, 0.75] if you want a 25% offset!
      } // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    }
  },
  computed: {
    ...mapState([
      'filterParams',
    ]),
    ...mapGetters([
      'getUser',
      'getInitializedContainer',
      'getSortedPosts',
      'getStreamOptionsContainer',
      'getPost',
      'getbusyLoading',
      'getbusyLoadingMore',
      'getMaxPostsLimitReached'
    ]),
    streamOptions() {
      return this.getStreamOptionsContainer(this.containernid)
    },
    sortedPosts() {
      return this.getSortedPosts(this.containernid)
    },
    initialized() {
      return this.getInitializedContainer(this.containernid)
    }
  },
  methods: {
    ...mapActions([
      'initializeStream',
      'addPost',
      'deletePost',
      'deleteComment',
      'addComment',
      'addUser',
      'loadMore',
      'setinfiniteScrollLimit',
    ]),
    initialize: function () {
      if (!this.aggregated) {
        // enable polling for this list
        this.setinfiniteScrollLimit(this.infiniteScrollLimit)
        this.$store.commit('setPostVisibleInViewPort', {containerNID: this.containernid, visibleInViewPort: true})
      }

      this.initializeStream(this.containernid)
    },
    // get mention member asynchronously and cache
    getMentionMembers: function (contextNID) {
      return this.$store.getters.getMentionMembers(contextNID)
    },
    onWaypointLoadMore({going}) {
      // going: in, out
      if (going === this.$waypointMap.GOING_IN) {
        this.loadMore(this.containernid)
      }
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
  watch: {
    busyLoading: function (val) {
      // jump to hash location
      const hash = location.hash
      if (this.initialized == true && val == false && hash) {
        setTimeout(() => {
          location.hash = ""
          location.hash = hash
        }, 100)
      }
    },
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
  transition: all .1s ease;
}

#stream .slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

#stream .slide-fade-enter, #stream .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */
{
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

#stream .list-enter, #stream .list-leave-to /* .list-leave-active below version 2.1.8 */
{
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

#stream *:focus {
  outline-width: 0px;
}

#stream {
  .load-more-wrapper {
    text-align: right;
    button {
      border: 0;
      background: none;
      color:  #337ab7;
      &:hover, &:active, &:focus {
        text-decoration: underline;
        color: #2c3e50;
      }
    }
  }
}

</style>
