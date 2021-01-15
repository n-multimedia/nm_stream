import Vue from 'vue'
import config from "@/assets/config";

export default {
    async addVote(nid, answerObj, token, cb, errorCb) {
        let votes = {arSelected: []}

        if (answerObj.arSelected) {
            votes.arSelected = answerObj.arSelected
        } else {
            votes.arSelected = [{value: answerObj.value, votes: answerObj.votes}]
        }

        let apiNodePollAddVoteUrl = config.api.apiNodePollAddVote.replace('%node', nid).replace('%token', token)

        Vue.axios.post(apiNodePollAddVoteUrl, votes, {withCredentials: true}).then((response) => {
            if (response.data.status === 1) {
                return cb(response.data)
            } else {
                // an error occured
                errorCb()
            }
        })
    }
}
