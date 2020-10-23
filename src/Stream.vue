<template>
    <div id="stream" class="container">
        <transition name="fade">
            <stream-filter v-if="initialized" :streamOptions="streamOptions"></stream-filter>
        </transition>
        <pulse-loader :loading="!initialized || busyLoading" :color="busyLoadingColor"
                      :size="busyLoadingSize"></pulse-loader>
        <stream-post-form
                v-if="initialized && streamOptions.containerNID > 0 && streamOptions.permissions.canCreatePost"
                :streamOptions="streamOptions"
                :mentionMembers="getMentionMembers(streamOptions.contextNID)"
                v-on:stream-post-added="addPost"
        />
        <div v-if="initialized && sortedPosts.length == 0">
            {{ $t('empty.no_posts_found') }}
        </div>
        <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busyLoading" infinite-scroll-distance="10"
             v-keep-scroll-position class="stream-post-wrapper">
            <transition-group name="list">
                <stream-post v-for="post in sortedPosts"
                             :key="post.nid"
                             :post="getPost(post.nid)"
                             :comments="getPostComments(post.nid)"
                             :streamOptions="streamOptions"
                             :mentionMembers="getMentionMembers(post.context.nid)"
                             v-on:stream-post-deleted="deletePost"
                             v-on:stream-comment-deleted="deleteComment"
                             v-on:stream-comment-added="addComment"
                             v-on:stream-user-added="addUser"
                />
            </transition-group>
        </div>
        <br/>
        <pulse-loader :loading="busyLoadingMore" :color="busyLoadingColor" :size="busyLoadingSize"></pulse-loader>
        <br/>
    </div>
</template>
<script>
    import Vue from 'vue'
    import StreamPost from './components/StreamPost'
    import StreamPostForm from './components/StreamPostForm'
    import StreamFilter from './components/widgets/StreamFilter'
    import {mapActions, mapGetters, mapState} from "vuex";

    export default {
        name: 'Stream',
        components: {
            StreamFilter,
            StreamPost,
            StreamPostForm
        },
        data() {
            return {
                mentionMembers: [],
                busyLoadingColor: '#888',
                busyLoadingSize: '12px',
                maxPostsLimitReached: false,
                loggedInUser: 1,
                infiniteScrollLimit: 10,
                maxPostsToShow: 10,
                pollingUpdate: null,
                containerNid: null,
                streamUpdateOnRerender: false,
            }
        },
        beforeMount: function () {
          if (this.$root.$el.attributes['data-container-nid']) {
            let containerNid = this.$root.$el.attributes['data-container-nid'].value
            this.$store.commit('setContainerNid', containerNid)
          }
        },
        computed: {
          ...mapState([
            'posts',
            'users',
            'comments',
            'streamOptions',
            'filterParams',
            'initialized',
            'busyLoading',
            'busyLoadingMore'
          ]),
          ...mapGetters([
            'getUser',
            'getSortedPosts',
            'getPost',
            'getPostComments',
          ]),
          sortedPosts() {
            return this.getSortedPosts
          },
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
            ]),
            initialize: function () {
              this.initializeStream()
            },
            mergeByProperty(arr1, arr2, prop) {
              Vue._.each(arr2, function (arr2obj) {
                var arr1obj = Vue._.find(arr1, function (arr1obj) {
                  return arr1obj[prop] === arr2obj[prop]
                })
                // If the object already exist extend it with the new values from arr2, otherwise just add the new object to arr1
                arr1obj ? Vue._.extend(arr1obj, arr2obj) : arr1.push(arr2obj)
              })
            },
            // get mention member asynchronously and cache
            getMentionMembers: function (contextNID) {
              return this.$store.getters.getMentionMembers(contextNID)
            },

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
            if(this.initialized == true && val == false && hash) {
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

    #bv-modal-delete-attachment.fade {
        opacity: initial;
    }

    #bv-modal-delete-attachment___BV_modal_outer_ .modal-backdrop {
        opacity: 0.5;
    }

    #bv-modal-delete-attachment .modal-dialog {
        top: 20vh;
    }

    #bv-modal-delete-attachment #bv-modal-delete-attachment___BV_modal_header_ .close {
        position: absolute;
        top: 15px;
        right: 15px;
    }

</style>
