export default {
  api: {
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
    apiNodePollAddVote: '/api/v2.0/nm_stream/node/%node/poll/add_vote/%token'
  }
}
