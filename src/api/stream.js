import Vue from 'vue'
import StreamOptions from "@/models/StreamOptions";
import config from '../assets/config.js'


export default {
    // initialize stream
    initializeStream: function (containerNID, cb) {
        let result = {}
        let url = config.api.apiInitUrl.replace('%node', containerNID)
        Vue.axios.get(url, {withCredentials: true}).then((response) => {
            result.posts = response.data.stream.posts
            result.users = response.data.stream.users
            result.comments = response.data.stream.comments
            result.loggedInUser = response.data.stream.loggedInUser
            result.streamOptions = this.processStreamOptions(response)

            cb(result)
        })
    },
    initializeStreamAggregated: function (cb) {
        let result = {}
        let url = config.api.apiInitAgrUrl
        Vue.axios.get(url, {withCredentials: true}).then((response) => {
            result.containers = response.data.stream.containers
            result.loggedInUser = response.data.stream.loggedInUser
            result.streamOptions = this.processStreamOptions(response)

            cb(result)
        })
    },
    updateStreamAggregated: function ({params, maxPostsToShow, token}, cb) {
        let result = {}
        let updateUrl = config.api.apiUpdateContextsUrl.replace('%offset', 0).replace('%limit', maxPostsToShow).replace('%token', token)
        Vue.axios.get(updateUrl, {
            params: params,
            withCredentials: true
        }).then((response) => {
            result.containers = response.data.stream.containers
            result.streamOptions = this.processStreamOptions(response)
            cb(result)
        })
    },
    // poll stream update
    updateStream({params, maxPostsToShow, containerNID, token}, cb) {
        let result = {}

        let pollUpdateUrl = config.api.apiPollUpdateUrl.replace('%node', containerNID).replace('%offset', 0).replace('%limit', maxPostsToShow).replace('%token', token)
        // get update data
        Vue.axios.get(pollUpdateUrl, {
            params: params,
            withCredentials: true
        }).then((response) => {
            result.posts = response.data.stream.posts
            result.users = response.data.stream.users
            result.comments = response.data.stream.comments
            result.comments = response.data.stream.comments
            result.timestamp = response.data.stream.timestamp

            cb(result)
        })
    },
    // poll stream update
    updateContextsStream({params, maxPostsToShow, token}, cb) {
        let result = {}

        let pollUpdateUrl = config.api.apiUpdateContextsUrl.replace('%offset', 0).replace('%limit', maxPostsToShow).replace('%token', token)
        // get update data
        Vue.axios.get(pollUpdateUrl, {
            params: params,
            withCredentials: true
        }).then((response) => {
            result.containers = response.data.stream.containers
            result.timestamp = response.data.stream.timestamp

            cb(result)
        })
    },
    //helper
    processStreamOptions(response) {
        let streamOptions = new StreamOptions()
        streamOptions.privacyOptions = response.data.stream.privacyOptions
        streamOptions.privacyOptionsAll = response.data.stream.privacyOptionsAll
        streamOptions.privacyDefault = response.data.stream.privacyDefault
        streamOptions.permissions = response.data.stream.permissions
        streamOptions.token = response.data.stream.token
        streamOptions.contextNID = response.data.stream.contextNID
        streamOptions.containerNID = response.data.stream.containerNID
        streamOptions.timestamp = response.data.stream.timestamp
        streamOptions.acceptedFiles = response.data.stream.acceptedFiles
        streamOptions.filterAvailableContexts = response.data.stream.filterAvailableContexts
        streamOptions.filterAvailableUsers = response.data.stream.filterAvailableUsers

        return streamOptions

    }
}
