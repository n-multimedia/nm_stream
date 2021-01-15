export default {
    api: {
        apiInitAgrUrl: 'http://localhost:9501/api/v2.0/nm_stream/initialize_aggregated',
        apiUpdateContextsUrl: 'http://localhost:9501/api/v2.0/nm_stream/update_contexts/%offset/%limit/%token',
        apiInitUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/initialize',
        apiPollUpdateUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/poll_update/%offset/%limit/%token',
        apiPostAttachmentDeleteUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/file/%file/delete/%token',
        apiPostAttachmentUploadUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/file/upload/%token',
        apiPostUpdateUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/update/%token',
        apiPostAddUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/add/%token',
        apiPostDeleteUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/delete/%token',
        apiCommentUpdateUrl: 'http://localhost:9501/api/v2.0/nm_stream/comment/%comment/update/%token',
        apiCommentAddUrl: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/comment/add/%token',
        apiCommentDeleteUrl: 'http://localhost:9501/api/v2.0/nm_stream/comment/%comment/delete/%token',
        apiNodePollAddVote: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/poll/add_vote/%token',
        apiUserMentionMembers: 'http://localhost:9501/api/v2.0/nm_stream/node/%node/get/mention_members'
    }
}
