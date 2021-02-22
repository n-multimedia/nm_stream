import Vue from 'vue'
import appConfig from '../../../../assets/config.js'

export default {

    async getMentionMembers(nid) {
        let apiNodeMentionUrl = appConfig.api.apiUserMentionMembers.replace('%node', nid)

        let requestData = {}

        // edit post => update
        let response = await Vue.axios.post(apiNodeMentionUrl, requestData, {withCredentials: true})

        if (response.data.status === 1) {
            return response.data.mention_members
        } else {
            // an error occured
            alert(this.$t('warning.error_occured_please_repeat_your_action'))
        }
    }
}
