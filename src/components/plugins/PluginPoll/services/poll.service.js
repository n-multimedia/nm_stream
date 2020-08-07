import Vue from 'vue'
import appConfig from '../../../../assets/config.js'

export default {
    async addVote(nid, answerObj, token) {
        let votes = {arSelected: []}

        if (answerObj.arSelected) {
            votes.arSelected = answerObj.arSelected
        } else {
            votes.arSelected = [{value: answerObj.value, votes: answerObj.votes}]
        }

        let apiNodePollAddVoteUrl = appConfig.api.apiNodePollAddVote.replace('%node', nid).replace('%token', token)

        let requestData = votes.arSelected

        // edit post => update
        let response = await Vue.axios.post(apiNodePollAddVoteUrl, requestData, {withCredentials: true})

        if (response.data.status === 1) {
            return response.data
        } else {
            // an error occured
            alert(this.$t('warning.error_occured_please_repeat_your_action'))
        }
    }
}
