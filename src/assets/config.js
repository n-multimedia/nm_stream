export default {
    api: {
        apiInitAgrUrl: '/api/v2.0/nm_stream/initialize_aggregated',
        apiUpdateContextsUrl: '/api/v2.0/nm_stream/update_contexts/%offset/%limit/%token',
        apiInitUrl: '/api/v2.0/nm_stream/node/%node/initialize',
        apiPollUpdateUrl: '/api/v2.0/nm_stream/node/%node/poll_update/%offset/%limit/%token',
        apiPostAttachmentDeleteUrl: '/api/v2.0/nm_stream/node/%node/file/%file/delete/%token',
        apiPostAttachmentUploadUrl: '/api/v2.0/nm_stream/node/%node/file/upload/%token',
        apiPostUpdateUrl: '/api/v2.0/nm_stream/node/%node/update/%token',
        apiPostAddUrl: '/api/v2.0/nm_stream/node/add/%token',
        apiPostDeleteUrl: '/api/v2.0/nm_stream/node/%node/delete/%token',
        apiCommentUpdateUrl: '/api/v2.0/nm_stream/comment/%comment/update/%token',
        apiCommentAddUrl: '/api/v2.0/nm_stream/node/%node/comment/add/%token',
        apiCommentDeleteUrl: '/api/v2.0/nm_stream/comment/%comment/delete/%token',
        apiNodePollAddVote: '/api/v2.0/nm_stream/node/%node/poll/add_vote/%token',
        apiUserMentionMembers: '/api/v2.0/nm_stream/node/%node/get/mention_members'
    }
}
