<template>
  <div id="stream-aggregated" class="container">
    <transition name="fade">
      <stream-filter v-if="initialized" :streamOptions="streamOptions"></stream-filter>
    </transition>
    <pulse-loader :loading="!initialized || busyLoading" :color="busyLoadingColor"
                  :size="busyLoadingSize"></pulse-loader>
    <transition-group name="list">
      <div v-for="container in containers" :key="container.nid" :data-nid="container.nid">
        <div class="stream-container-label">
          <b-button v-b-toggle :href="'#collapse-nid-' + container.nid" class="btn btn-link btn-collapse"
                    data-target="'#collapse-nid-' + container.nid" @click.prevent>
            <span class="when-open"><font-awesome-icon :icon="iconFaArrowDown"/></span><span class="when-closed"><font-awesome-icon
              :icon="iconFaArrowUp"/></span>
          </b-button>
          <a :href="container.url"> {{ container.title }}</a>:
          <a :href="container.context_url">{{ container.context_title }}</a>
        </div>
        <b-collapse visible class="stream-container-wrapper" :id="'collapse-nid-' + container.nid">
          <stream-list
              :containernid="container.nid"
              :data-nid="container.nid"
              :aggregated=true
              v-waypoint="{ active: true, callback: onWaypointContainer, options: intersectionOptions }">
          </stream-list>
        </b-collapse>
      </div>
    </transition-group>
    <div v-if="!busyLoading"
         v-waypoint="{ active: true, callback: onWaypointLoadMore, options: intersectionOptions }"></div>
    <br/>
    <pulse-loader :loading="!busyLoading && getbusyLoadingMore(0)" :color="busyLoadingColor" :size="busyLoadingSize"></pulse-loader>
    <br/>
  </div>
</template>

<script>
import StreamFilter from  "@/components/widgets/StreamFilter"
import {mapActions, mapGetters, mapState} from "vuex";
import StreamList from "@/components/views/StreamList";
import {faArrowAltCircleDown, faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons'

export default {
  name: "StreamListAggregated",
  components: {
    StreamFilter,
    StreamList,
  },
  data() {
    return {
      mentionMembers: [],
      busyLoadingColor: '#888',
      busyLoadingSize: '12px',
      maxPostsLimitReached: false,
      loggedInUser: 1,
      infiniteScrollLimit: 2,
      iconFaArrowUp: faArrowAltCircleUp,
      iconFaArrowDown: faArrowAltCircleDown,
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: [0, 1] // [0.25, 0.75] if you want a 25% offset!
      } // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    }
  },
  computed: {
    ...mapGetters([
      'getStreamOptions',
      'getInitializedContainer',
      'getbusyLoading',
      'getbusyLoadingMore'
    ]),
    ...mapState([
      'containers',
      'filterParams',
      'initialized',
    ]),
    busyLoading() {
      return this.getbusyLoading(0)
    },
    initialized() {
      return this.getInitializedContainer(0)
    },
    streamOptions() {
      return this.getStreamOptions()
    },
  },
  methods: {
    ...mapActions([
      'initializeStreamAggregated',
      'loadMoreContainers',
      'setinfiniteScrollLimit',
    ]),
    initialize: function () {
      this.setinfiniteScrollLimit(this.infiniteScrollLimit)
      this.initializeStreamAggregated()
    },
    // get mention member asynchronously and cache
    getMentionMembers: function (contextNID) {
      return this.$store.getters.getMentionMembers(contextNID)
    },
    onWaypointContainer({el, going}) {
      // going: in, out
      // direction: top, right, bottom, left
      const nid = el.getAttribute('data-nid');
      if (going === this.$waypointMap.GOING_IN) {
        this.$store.commit('setPostVisibleInViewPort', {containerNID: nid, visibleInViewPort: true})
      }
      if (going === this.$waypointMap.GOING_OUT) {
        this.$store.commit('setPostVisibleInViewPort', {containerNID: nid, visibleInViewPort: false})
      }
    },
    onWaypointLoadMore({going}) {
      if (this.busyLoading || this.getbusyLoadingMore(0)) {
        // wait until page has been loaded
        return
      }

      // going: in, out
      if (going === this.$waypointMap.GOING_IN) {
        this.loadMoreContainers(0)
      }
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
}
</script>


<style lang="scss">

#stream-aggregated {
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

#stream-aggregated {
  .stream-container-wrapper {
    border-left: 1px solid #999;
    margin-bottom: 5em;
    margin-left: 1em;
  }
}

#stream-aggregated .card {
  padding: 1em;
  margin-bottom: 1em;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
#stream-aggregated .slide-fade-enter-active {
  transition: all .1s ease;
}

#stream-aggregated .slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

#stream-aggregated .slide-fade-enter, #stream-aggregated .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */
{
  transform: translateX(10px);
  opacity: 0;
}

#stream-aggregated .list-item {
  display: inline-block;
  margin-right: 10px;
}

#stream-aggregated .list-enter-active, #stream-aggregated .list-leave-active {
  transition: all 1s;
}

#stream-aggregated .list-enter, #stream-aggregated .list-leave-to /* .list-leave-active below version 2.1.8 */
{
  opacity: 0;
  transform: translateY(30px);
}

/**
Flipping
 */
#stream-aggregated .card-flip {
  perspective: 100vw;

  &.flip-active .flip,
  &.flip-active .flip {
    transform: rotateY(180deg);
  }
}

#stream-aggregated .card-flip,
#stream-aggregated .front,
#stream-aggregated .back-delete,
#stream-aggregated .back-edit {
  width: 100%;
  // height: 480px;
}

#stream-aggregated .back-delete {
  button {
    margin-left: 10px;
  }
}

#stream-aggregated .flip {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

#stream-aggregated .front,
#stream-aggregated .back-delete,
#stream-aggregated .back-edit {
  backface-visibility: hidden;
  // position: absolute;
  // top: 0;
  // left: 0;
}

#stream-aggregated .back-delete,
#stream-aggregated .back-edit {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

#stream-aggregated .front {
  z-index: 2;
  transform: rotateY(0deg);
}

#stream-aggregated .back-delete,
#stream-aggregated .back-edit {
  transform: rotateY(180deg);
}

#stream-aggregated .stream-post-wrapper .v-spinner {
  position: absolute;
}

#stream-aggregated *:focus {
  outline-width: 0px;
}

.stream-container-label {
  text-align: left;

  .btn-collapse,
  .btn-collapse:active,
  .btn-collapse:focus,
  .btn-collapse:hover {
    background-color: transparent !important;
    box-shadow: none !important;;
    border: 0 !important;
    color: #337ab7 !important;

    a {
      color: #337ab7 !important;
    }
  }

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}

</style>
