import Vue from 'vue'
import Vuex from 'vuex'
import streamApi from '../api/stream'
import MentionService from "@/components/plugins/PluginMention/services/mention.service"

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state: {
        containerNID: 0, //0 = global
        aggregated: false, //0 = global
        containers: [],
        pollUpdateInterval: [],
        containersData: [{'initialized': false}],
        // attributes - todo move to own class
        // - visibleInViewPort
        // - posts
        // - comments
        // - busyLoading
        // - initialized
        // - busyLoadingMore
        // maxPostsToShow: 2,
        // comments: [],
        // posts: [],
        // users: [],
        // streamOptions: [],
        mentionMembers: [],
        filterParams: [],
        //busyLoading: false,
        //busyLoadingMore: false, // complete list loading (e.g. container)
        //initialized: false,
        infiniteScrollLimit: 3,
        infiniteScrollLimitContainers: 2,
        pollingUpdate: false,
        users: []
    },
    strict: debug,
    actions: {
        setinfiniteScrollLimit({commit}, infiniteScrollLimit) {
            commit('setinfiniteScrollLimit', infiniteScrollLimit)
        },
        initializeStream({commit, dispatch, getters}, containerNID) {

            commit('setBusy', {containerNID: containerNID, busy: true})


            // pass filter parameters
            const params = getters.getFilterParams()

            streamApi.initializeStream({params, containerNID}, data => {
                commit('initializeStream', {containerNID: containerNID, data: data})

                // expand user array
                data.users.forEach(user => {
                    dispatch("addUser", user)
                })

                commit('setBusy', {containerNID: containerNID, busy: false})
                commit('setBusyMore', {containerNID: containerNID, busy: false})
            })

            // start polling
            dispatch('pollUpdate', containerNID)
        },
        initializeStreamAggregated({state, commit, dispatch}) {
            // init object
            state.containersData[0] = {}

            //override scroll limit for aggr view

            commit('setMaxToShow', {containerNID: 0, maxToShow: state.infiniteScrollLimitContainers})

            commit('setBusy', {containerNID: 0, busy: true})


            streamApi.initializeStreamAggregated(data => {
                commit('initializeStreamAggregated', data)
                commit('setBusy', {containerNID: 0, busy: false})
                commit('setBusyMore', {containerNID: 0, busy: false})

            })

            // start polling
            dispatch('pollUpdate', 0)
        },
        updateStreamAggregated({state, commit, getters}) {
            // abort if container has not been initialized yet
            if (!state.containersData[0].initialized) {
                return
            }

            const token = state.containersData[0].streamOptions.token

            if (!token) {
                return
            }

            // pass filter parameters
            const params = getters.getFilterParams()
            const maxContainersToShow = state.containersData[0].maxPostsToShow

            commit('setBusy', {containerNID: 0, busy: true})
            streamApi.updateStreamAggregated({params, maxContainersToShow, token}, data => {
                commit('updateContainers', data)
                commit('setBusy', {containerNID: 0, busy: false})
            })
        },
        updateStream({dispatch, commit, getters, state}, containerNID) {

            // abort if container has not been initialized yet
            if(!state.containersData[containerNID]) {
                // polling
                return
            }

            if (!state.containersData[containerNID].initialized || !!state.containersData[containerNID].busyLoading || !!state.containersData[containerNID].busyLoadingMore) {
                return
            }

            const maxPostsToShow = state.containersData[containerNID].maxPostsToShow
            const token = state.containersData[containerNID].streamOptions.token

            if (!token) {
                return
            }

            // pass filter parameters
            const params = getters.getFilterParams()

            //commit('setBusy', {containerNID: containerNID, busy: true})

            streamApi.updateStream({params, maxPostsToShow, containerNID, token}, data => {
                if (state.containersData[containerNID].busyLoadingMore) {

                    commit('setMaxPostsLimitReached', {
                        containerNID: containerNID,
                        maxPostsLimitReached: state.containersData[containerNID].posts.length >= data.posts.length
                    })
                    commit('setBusyMore', {containerNID: containerNID, busy: false})
                }
                commit('setBusy', {containerNID: containerNID, busy: false})
                commit('updateStream', {containerNID: containerNID, data: data})

                // expand user array
                data.users.forEach(user => {
                    dispatch("addUser", user)
                })
            })
        },
        updateContainers({getters, state, commit}) {
            const maxPostsToShow = state.containersData[0].maxPostsToShow
            const token = getters.getStreamOptions().token

            if (!token) {
                return
            }

            // pass filter parameters
            const params = getters.getFilterParams()

            streamApi.updateContextsStream({params, maxPostsToShow, token}, data => {
                if (state.containersData[0].busyLoadingMore) {
                    commit('setMaxPostsLimitReached', {
                        containerNID: 0,
                        maxPostsLimitReached: state.containers.length >= data.containers.length
                    })
                }
                commit('setBusy', {containerNID: 0, busy: false})
                commit('setBusyMore', {containerNID: 0, busy: false})
                commit('updateContainers', data)
            })
        },
        addPost: function ({commit}, post) {
            commit('addPost', post)
        },
        updatePost: function ({commit}, post) {
            commit('updatePost', post)
        },
        updateAttachments: function ({commit}, post) {
            commit('updateAttachments', post)
        },
        deletePost: function ({commit}, data) {
            commit('deletePost', data)
        },
        deleteComment: function ({commit}, data) {
            commit('deleteComment', data)
        },
        addComment: function ({commit}, data) {
            commit('addComment', data)
        },
        updateComment: function ({commit}, data) {
            commit('updateComment', data)
        },
        addUser: function ({commit, getters}, user) {
            if (!getters.getUser(user.uid)) {
                commit('addUser', user)
            }
        },
        setFilter({commit, state, dispatch}, filter) {
            commit('setFilter', filter)


            if (state.containersData[0].streamOptions && state.aggregated) {
                commit('setMaxPostsLimitReached', {
                    containerNID: 0,
                    maxPostsLimitReached: false
                })

                dispatch('updateStreamAggregated')
                // important order
                commit('setBusy', {containerNID: 0, busy: true})
            } else {
                clearInterval(state.pollUpdateInterval)

                commit('setMaxPostsLimitReached', {
                    containerNID: state.containerNID,
                    maxPostsLimitReached: false
                })

                dispatch('pollUpdate', state.containerNID)
                // important order
                commit('setBusy', {containerNID: state.containerNID, busy: true})
            }
        },
        loadMore({commit, state, dispatch}, containerNID) {
            // wait for initialization
            // do not poll if last poll is still loading
            // do not poll if there is no more new content coming
            // todo!!

            if (!state.containersData[containerNID] || !state.containersData[containerNID].initialized || state.containersData[containerNID].busyLoadingMore || state.containersData[containerNID].maxPostsLimitReached) {
                return false
            }

            const showMoreNum = state.infiniteScrollLimit

            commit('setMaxToShow', {
                containerNID: containerNID,
                maxToShow: state.containersData[containerNID].maxPostsToShow + showMoreNum
            })

            // trigger a update
            dispatch('updateStream', containerNID)
            // important set busy afterwards
            commit('setBusyMore', {containerNID: containerNID, busy: true})

        },
        loadMoreContainers({commit, dispatch, state}, containerNID) {
            // wait for initialization
            // do not poll if last poll is still loading
            // do not poll if there is no more new content coming
            if (!state.containersData[containerNID] || !state.containersData[containerNID].initialized || state.containersData[containerNID].busyLoadingMore || state.containersData[containerNID].busyLoading || state.containersData[containerNID].maxPostsLimitReached) {
                return false
            }

            commit('setBusyMore', {containerNID: 0, busy: true})
            commit('setMaxToShow', {
                containerNID: containerNID,
                maxToShow: state.containersData[containerNID].maxPostsToShow + state.infiniteScrollLimitContainers
            })

            // trigger a update
            dispatch('updateContainers')
        },
        pollUpdate({dispatch, commit, state}, containerNID) {

            //console.log('check poll condition')
            //console.log(state.containersData[containerNID])

            // todo prevent polling overkill in aggregated mode
            if(state.pollUpdateInterval[containerNID]) {
                clearInterval(state.pollUpdateInterval[containerNID])
            }


            dispatch('updateStream', containerNID)
            /*const pollingUpdate = */
            let pollUpdateInterval = setInterval(() => {
                // check if user sees the container in his viewport
                // check if browser has focus
                let focused = document.hasFocus()

                // check state.containersData[containerNID] because of active poll request after filter
                if (!focused || state.containersData[containerNID] && !state.containersData[containerNID].visibleInViewPort) {
                    return;
                }
                dispatch('updateStream', containerNID)
            }, 5000)

            commit('setPollUpdateInterval', {containerNID: containerNID, pollUpdateInterval: pollUpdateInterval})
        },
    },
    getters: {
        getbusyLoading: (state) => (containerNID) => {

            if (!state.containersData[containerNID]) {
                return false
            }

            return state.containersData[containerNID].busyLoading
        },
        getbusyLoadingMore: (state) => (containerNID) => {

            if (!state.containersData[containerNID]) {
                return false
            }

            return state.containersData[containerNID].busyLoadingMore
        },
        getInitializedContainer: state => (containerNID) => {
            if(!state.containersData[containerNID]) {
                return false
            }

            return state.containersData[containerNID].initialized
        },
        getStreamOptions: state => () => {
            const containerNID = 0
            // sort by created and sticky
            if (state.containersData[containerNID]) {
                return state.containersData[containerNID].streamOptions
            }

            return false
        },
        getStreamOptionsContainer: state => (containerNID) => {
            // sort by created and sticky
            if (state.containersData[containerNID]) {
                return state.containersData[containerNID].streamOptions
            }

            return false
        },
        getSortedPosts: state => (containerNID) => {
            // sort by created and sticky
            let sortedPosts = Vue._.chain(state.containersData[containerNID].posts).sortBy('created').sortBy('sticky').reverse().value()
            let slicedPosts = sortedPosts.slice(0, state.containersData[containerNID].maxPostsToShow)
            return slicedPosts
        },
        getPost: (state, getters) => (containerNID, nid) => {
            if (!state.containersData[containerNID].posts) {
                //console.log(state.containersData[containerNID].posts)
                return null
            }
            let result = state.containersData[containerNID].posts.filter(post => post.nid === nid)[0]
            let post = result
            post.user = getters.getUser(post.uid)
            return post
        },
        getUser: (state) => (uid) => {
            return state.users.find(user => user.uid === uid)
        },
        getPostComments: (state, getters) => (containerNID, nid) => {
            //console.log(containerNID)
            //console.log(nid)
            //console.log(state.containersData[containerNID])
            let result = state.containersData[containerNID].comments.filter(comment => comment.nid === nid)
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
            if (state.mentionMembers[contextNID]) {
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
        },
        getMaxPostsLimitReached: (state) => (containerNID) => {

            if (!state.containersData[containerNID]) {
                return false
            }

            return state.containersData[containerNID].maxPostsLimitReached
        },
    },
    mutations: {
        setcontainerNID(state, containerNID) {
            // undefined or 0
            if (!containerNID) {
                state.aggregated = true
            }
            state.containerNID = containerNID
        },
        initializeStream(state, payload) {
            const containerNID = payload.containerNID

            const data = payload.data
            if (!state.containersData[containerNID]) {
                state.containersData[containerNID] = {}
            }

            state.containersData[containerNID].posts = data.posts
            state.containersData[containerNID].comments = data.comments
            state.containersData[containerNID].streamOptions = data.streamOptions
            // provide default attributes
            state.containersData[containerNID].initialized = true
            state.containersData[containerNID].maxPostsToShow = state.infiniteScrollLimit

            // notify vue about deep change
            state.containersData = state.containersData.slice(0)
        },
        initializeStreamAggregated(state, data) {
            state.containers = data.containers.slice(0, state.infiniteScrollLimit)

            state.containersData[0].streamOptions = data.streamOptions
            state.containersData[0].initialized = true

            // prepare structure
            /*state.containers.forEach(container => {
                state.containersData[container.nid] = {}
                state.containersData[container.nid].initialized = false
            })*/

        },
        updateContainers(state, data) {
            state.containers = data.containers

            state.containersData[0].streamOptions.timestamp = data.timestamp

            /*
            state.containers.forEach(container => {
                if (container.nid > 0 && state.containersData[container.nid]) {
                    state.containersData[container.nid].posts = []
                    state.containersData[container.nid].comments = []
                }
            })*/

            //console.log(state.containers)
            // prepare structure for new polled containers
            /*state.containers.forEach(container => {
                if (!state.containersData[container.nid]) {
                    state.containersData[container.nid] = {}
                    state.containersData[container.nid].initialized = false
                }
            })*/


        },
        updateStream(state, payload) {
            const containerNID = payload.containerNID
            const data = payload.data

            //keys chaning! propagate changes
            //state.containersData[containerNID].posts = []
            //state.containersData = state.containersData.slice(0)

            state.containersData[containerNID].posts = data.posts
            state.containersData[containerNID].comments = data.comments
            state.containersData[containerNID].streamOptions.timestamp = data.timestamp

            state.containersData = state.containersData.slice(0)
        },
        addPost: function (state, post) {

            state.containersData[post.container.nid].posts.push(post)
            // show one more post
            state.containersData[post.container.nid].maxPostsToShow++

            state.containersData = state.containersData.slice(0)
        },
        updatePost: function (state, post) {
            const containerNID = post.container.nid

            let postListIndex = state.containersData[containerNID].posts.indexOf(post)
            if (postListIndex > -1) {
                state.containersData[containerNID].posts[postListIndex] = post
                state.containersData = state.containersData.slice(0)
            }

        },
        updateAttachments: function (state, _post) {
            const containerNID = _post.container.nid

            let result = state.containersData[containerNID].posts.filter(post => post.nid === _post.nid)[0]

            if (result) {
                result.attachments = _post.attachments
                state.containersData = state.containersData.slice(0)
            }

        },
        deletePost: function (state, post) {
            const containerNID = post.container.nid

            let postListIndex = state.containersData[containerNID].posts.indexOf(post)
            if (postListIndex > -1) {
                state.containersData[containerNID].posts.splice(postListIndex, 1)
            }

            state.containersData = state.containersData.slice(0)
        },
        updatePosts: function (state, data) {
            const containerNID = data.containerNID
            const posts = data.posts

            state.containersData[containerNID].posts = posts

            state.containersData = state.containersData.slice(0)
        },
        addComment: function (state, data) {
            const containerNID = data.containerNID
            const comment = data.comment

            state.containersData[containerNID].comments.push(comment)

            state.containersData = state.containersData.slice(0)
        },
        updateComment: function (state, data) {
            const containerNID = data.containerNID
            const comment = data.comment

            let commentListIndex = state.containersData[containerNID].comments.indexOf(comment)
            if (commentListIndex > -1) {
                state.containersData[containerNID].comments[commentListIndex] = comment
                state.containersData = state.containersData.slice(0)
            }
        },
        deleteComment: function (state, data) {
            const containerNID = data.containerNID
            const comment = data.comment

            let commentListIndex = state.containersData[containerNID].comments.indexOf(comment)
            if (commentListIndex > -1) {
                state.containersData[containerNID].comments.splice(commentListIndex, 1)
            }

            state.containersData = state.containersData.slice(0)

        },
        updateComments: function (state, data) {
            const containerNID = data.containerNID
            const comments = data.comments

            state.containersData[containerNID].comments = comments

            state.containersData = state.containersData.slice(0)
        },
        addUser: function (state, user) {
            state.users.push(user)
        },
        updateUsers: function (state, users) {
            state.users = users
        },
        updateInitialized: function (state, data) {
            const containerNID = data.containerNID
            const initialized = data.initialized

            state.containersData[containerNID].initialized = initialized

            state.containersData = state.containersData.slice(0)
        },
        setFilter(state, filter) {
            state.filterParams = filter
        },
        setBusy(state, data) {
            const containerNID = data.containerNID
            const busy = data.busy

            // initialize object, if not existing yet
            if (!state.containersData[containerNID]) {
                state.containersData[containerNID] = {}
            }

            state.containersData[containerNID].busyLoading = busy

            state.containersData = state.containersData.slice(0)
        },
        setPostVisibleInViewPort(state, data) {
            const containerNID = data.containerNID
            const visibleInViewPort = data.visibleInViewPort

            // initialize object, if not existing yet
            if (!state.containersData[containerNID]) {
                state.containersData[containerNID] = {}
            }

            state.containersData[containerNID].visibleInViewPort = visibleInViewPort

            //state.containersData = state.containersData.slice(0)
        },
        setBusyMore(state, data) {
            const containerNID = data.containerNID
            const busy = data.busy

            state.containersData[containerNID].busyLoadingMore = busy

            state.containersData = state.containersData.slice(0)
        },
        setMaxToShow(state, data) {

            const containerNID = data.containerNID
            const maxToShow = data.maxToShow

            state.containersData[containerNID].maxPostsToShow = maxToShow

            state.containersData = state.containersData.slice(0)

        },
        setPollingUpdate(state, data) {
            const containerNID = data.containerNID
            const pollingUpdate = data.pollingUpdate

            state.containersData[containerNID].pollingUpdate = pollingUpdate

            state.containersData = state.containersData.slice(0)

        },
        setMaxPostsLimitReached(state, data) {
            const containerNID = data.containerNID
            const maxPostsLimitReached = data.maxPostsLimitReached

            state.containersData[containerNID].maxPostsLimitReached = maxPostsLimitReached

            state.containersData = state.containersData.slice(0)
        },
        setinfiniteScrollLimit(state, infiniteScrollLimit) {
            state.infiniteScrollLimit = infiniteScrollLimit
        },
        setPollUpdateInterval(state, data) {
            const containerNID = data.containerNID
            const pollUpdateInterval = data.pollUpdateInterval
            state.pollUpdateInterval[containerNID] = pollUpdateInterval
        }
    }
})
