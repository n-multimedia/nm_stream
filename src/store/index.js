import Vue from 'vue'
import Vuex from 'vuex'
import streamApi from '../api/stream'
import MentionService from "@/components/plugins/PluginMention/services/mention.service"

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state: {
        posts: [],
        users: [],
        comments: [],
        streamOptions: [],
        mentionMembers: [],
        filterParams: [],
        busyLoading: false,
        busyLoadingMore: false,
        initialized: false,
        infiniteScrollLimit: 10,
        maxPostsToShow: 10,
        pollingUpdate: false,
        maxPostsLimitReached: false,
        containerNid: null,
    },
    strict: debug,
    actions: {
        initializeStream({commit, dispatch, state}) {
            const containerNid = state.containerNid
            streamApi.initializeStream(containerNid, data => {
                commit('initializeStream', data)
            })

            commit('setBusy', true)

            // start polling
            dispatch('pollUpdate')
        },
        updateStream({commit, getters, state}) {
            const containerNid = state.containerNid
            const maxPostsToShow = state.maxPostsToShow
            const token = state.streamOptions.token

            if(!token) {
                return
            }

            // pass filter parameters
            const params = getters.getFilterParams()

            streamApi.updateStream({params, maxPostsToShow, containerNid, token}, data => {
                if (this.busyLoadingMore) {
                    commit('maxPostsLimitReached', state.posts.length >= data.posts.length)
                    commit('busyLoadingMore', false)
                }
                commit('setBusy', false)
                commit('setBusyMore', false)
                commit('updateStream', data)
            })
        },
        addPost: function ({commit}, post) {
            commit('addPost', post)
        },
        deletePost: function ({commit}, post) {
            commit('deletePost', post)
        },
        deleteComment: function ({commit}, comment) {
            commit('deleteComment', comment)
        },
        addComment: function ({commit}, comment) {
            commit('addComment', comment)
        },
        addUser: function ({commit, getters}, user) {
            if (!getters.getUser(user.uid)) {
                commit('addUser', user)
            }
        },
        setFilter({commit, dispatch}, filter) {
            commit('setFilter', filter)
            dispatch('pollUpdate')
        },
        loadMore({commit, state, dispatch}) {
            // wait for initialization
            // do not poll if last poll is still loading
            // do not poll if there is no more new content coming
            if (!state.initialized || state.busyLoadingMore || state.maxPostsLimitReached) {
                return false
            }

            commit('setBusyMore', true)
            commit('setMaxToShow', state.maxPostsToShow + state.infiniteScrollLimit)

            // trigger a update
            dispatch('pollUpdate')

        },
        pollUpdate({dispatch, state, commit}) {
            clearInterval(state.pollingUpdate)
            // set busy flag
            commit('setBusy', true)
            dispatch('updateStream')
            const pollingUpdate = setInterval(() => {
                dispatch('updateStream')
            }, 5000)
            commit('setPollingUpdate', pollingUpdate)
        },
    },
    getters: {
        getSortedPosts: state => {
            // sort by created and sticky
            let sortedPosts = Vue._.chain(state.posts).sortBy('created').sortBy('sticky').reverse().value()

            let slicedPosts = sortedPosts.slice(0, state.maxPostsToShow)

            return slicedPosts
        },
        getPost: (state, getters) => (nid) => {
            let result = state.posts.find(post => post.nid === nid)
            let post = result
            post.user = getters.getUser(post.uid)
            return post
        },
        getUser: (state) => (uid) => {
            return state.users.find(user => user.uid === uid)
            //return Vue._.find(state.users, ['uid', uid])
        },
        getPostComments: (state, getters) => (nid) => {
            let result = state.comments.filter(comment => comment.nid === nid)
            if (result && result.length > 0) {
                for (let comment in result) {
                    result[comment].user = getters.getUser(result[comment].uid)
                }
            }
            return result
        },
        getFilterParams: (state) => () => {
            const params = new URLSearchParams()

            if (state.filterParams) {
                if (state.filterParams.context) {
                    params.append('context_nid', state.filterParams.context)
                }
                if (state.filterParams.user) {
                    params.append('user_uid', state.filterParams.user)
                }
                if (state.filterParams.privacy) {
                    params.append('privacy_key', state.filterParams.privacy)
                }
            }

            return params
        },
        getMentionMembers: (state) => (contextNID) => {
            if(state.mentionMembers[contextNID]) {
                // return cached
                return state.mentionMembers[contextNID]
            }
            // return empty array
            state.mentionMembers[contextNID] = []

            // async get options
            MentionService.getMentionMembers(contextNID, (result) => {
                state.mentionMembers[contextNID] = result
            }, () => {
                console.error(this.$t('warning.error_occured_please_repeat_your_action'))
            })

            return state.mentionMembers
        }
    },
    mutations: {
        setContainerNid(state, containerNid) {
            state.containerNid = containerNid
        },
        initializeStream(state, data) {
            state.posts = data.posts
            state.users = data.users
            state.comments = data.comments
            state.streamOptions = data.streamOptions

            state.initialized = true
        },
        updateStream(state, data) {
            state.posts = data.posts
            state.users = data.users
            state.comments = data.comments
            state.streamOptions.timestamp = data.timestamp
        },
        addPost: function(state, post) {
            state.posts.push(post)
        },
        deletePost: function(state, post) {
            let postListIndex = state.posts.indexOf(post)
            if(postListIndex > -1) {
                state.posts.splice(postListIndex, 1)
            }
        },
        updatePosts: function (state, posts) {
            state.posts = posts
        },
        addComment: function (state, comment) {
            state.comments.push(comment)
        },
        deleteComment: function (state, comment) {
            let commentListIndex = state.comments.indexOf(comment)
            if(commentListIndex > -1) {
                state.comments.splice(commentListIndex, 1)
            }
        },
        updateComments: function (state, comments) {
            state.comments = comments
        },
        addUser: function (state, user) {
            state.users.push(user)
        },
        updateUsers: function (state, users) {
            state.users = users
        },
        setFilter(state, filter) {
            state.filterParams = filter
        },
        setBusy(state, busy) {
            state.busyLoading = busy
        },
        setBusyMore(state, busy) {
            state.busyLoadingMore = busy
        },
        setMaxToShow(state, maxToShow) {
            state.maxPostsToShow = maxToShow
        },
        setPollingUpdate(state, pollingUpdate) {
            state.pollingUpdate = pollingUpdate
        },
        maxPostsLimitReached(state, postsLimitReached) {
            state.maxPostsLimitReached = postsLimitReached
        }
    }
})
