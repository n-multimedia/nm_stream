import Vue from 'vue'
import StreamOptions from "@/models/StreamOptions";
import config from '../assets/config.js'


export default {
    // initialize stream
    initializeStream:function (containerNid, cb) {
        let result = {}
        let url = config.api.apiInitUrl.replace('%node', containerNid)
        Vue.axios.get(url, {withCredentials: true}).then((response) => {
            result.posts = response.data.stream.posts
            result.users = response.data.stream.users
            result.comments = response.data.stream.comments
            result.loggedInUser = response.data.stream.loggedInUser
            result.streamOptions = new StreamOptions()
            result.streamOptions.privacyOptions = response.data.stream.privacyOptions
            result.streamOptions.privacyOptionsAll = response.data.stream.privacyOptionsAll
            result.streamOptions.privacyDefault = response.data.stream.privacyDefault
            result.streamOptions.permissions = response.data.stream.permissions
            result.streamOptions.token = response.data.stream.token
            result.streamOptions.contextNID = response.data.stream.contextNID
            result.streamOptions.containerNID = response.data.stream.containerNID
            result.streamOptions.timestamp = response.data.stream.timestamp
            result.streamOptions.acceptedFiles = response.data.stream.acceptedFiles
            result.streamOptions.filterAvailableContexts = response.data.stream.filterAvailableContexts
            result.streamOptions.filterAvailableUsers = response.data.stream.filterAvailableUsers

            cb(result)
        })
    },
    // poll stream update
    updateStream({params, maxPostsToShow, containerNid, token}, cb) {
        let result = {}

        let pollUpdateUrl = config.api.apiPollUpdateUrl.replace('%node', containerNid).replace('%offset', 0).replace('%limit', maxPostsToShow).replace('%token', token)
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
    }
}
