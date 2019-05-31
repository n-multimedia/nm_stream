<template>
  <!-- Card Flip -->
  <div class="card-flip">
    <div class="flip">
      <div class="front">
        <div class="stream-post card">
          <div class="row post-context" v-if="this.streamOptions.containerNID !== this.post.container.nid">
            <div class="col-12">
              <span class="float-right"> {{ $t('label.postContextFrom') }}: <a :href="streamLink">{{this.post.container.title}}</a> </span>
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <img class="card-img-top rounded-circle" :src="post.user.avatarUrl" :title="post.user.name"/>
            </div>
            <div class="col-10">
              <div class="row">
                <div class="col-12 post-header">
                  <div v-if="this.privacy !== null" class="post-privacy-wrapper float-right">
                    <img class="post-privacy" :src="privacy.img" :alt="privacy.title" :title="privacy.title">
                  </div>
                  <div v-if="canEdit || canDelete">
                    <b-dropdown text="..." class="post-actions-dropdown m-md-2 float-right" offset="-120">
                      <b-dropdown-item v-if="canEdit" v-on:click="editPost">{{ $t('button.edit') }}</b-dropdown-item>
                      <b-dropdown-item v-if="canDelete" v-on:click="deletePost">{{ $t('button.delete') }}</b-dropdown-item>
                    </b-dropdown>
                  </div>
                  <div class="username"><a :href="post.user.profileUrl">{{post.user.name}}</a></div>
                  <div class="created">
                    <font-awesome-icon :icon="['far', 'clock']" /><span :title="post.created | moment('L LT')"> {{ post.created | moment('from') }}
                      <!--(am {{ post.created | moment("L") }} um {{ post.created | moment("LTS") }})--></span>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12 body">
                  <p tag="p" v-html="post.body_formatted" />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div class="stream-post-attachments" v-if="post.attachments.length > 0">
                    <font-awesome-icon :icon="['far', 'file']" /> {{ $t('label.attachments') }}
                    <ul>
                      <li :key="attachment.fid" v-for="attachment in post.attachments">
                        <span v-html="attachment.download_link"></span>
                        <!-- todo delete attachment action -->
                        <a href="#"  :title="$t('button.delete_attachment')" class="attachment-trash-delete" v-if="attachment.permissions.canDelete" v-on:click.prevent="onAttachmentDeleteConf(attachment)"><font-awesome-icon :icon="['far', 'trash-alt']" /></a>
                      </li>
                    </ul>
                  </div>
                  <div class="stream-post-footer" v-if="sortedComments.length > 0">
                    <div>
                      <transition name="slide-fade">
                        <a href="#" v-if="!showComments" key="true" v-on:click.prevent="toggleComments">
                          {{ $t('link.show_x_comments', { count: sortedComments.length }) }}
                        </a>
                        <a href="#" v-else key="false" v-on:click.prevent="showComments = !showComments">{{ $t('link.hide_x_comments', { count: sortedComments.length }) }}</a>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row comments-wrapper">
            <div class="col-10 offset-2">
              <stream-comment-form v-if="canCreateComment" v-bind:streamOptions="streamOptions"
                                   v-on:stream-user-added="addUser"
                                   v-on:stream-comment-added="addComment"
                                   :post="post"></stream-comment-form>
              <transition name="fade">
                <div v-if="sortedComments.length > 0 && showComments === true">
                  <transition-group name="list">
                    <stream-comment v-for="comment in sortedComments"
                                    :streamOptions="streamOptions"
                                    :key="comment.cid"
                                    :comment="comment"
                                    v-on:stream-comment-deleted="deleteComment"
                                    :user="comment.user"/>
                  </transition-group>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      <div class="back-edit" ref="backEdit">
        <div class="stream-post card">
          <stream-post-form ref="streamPostForm"
                            :streamOptions="streamOptions"
                            :editPost="post"
                            v-on:form-edit-canceled="editCanceled()"
                            v-on:post-form-onAttachmentDeleteConf="onAttachmentDeleteConf"
          >
          </stream-post-form>
        </div>
      </div>
      <div class="back-delete" ref="backDelete">
        <div class="stream-post card">
          <h3>{{ $t('warning.delete_post_really_want_to') }}</h3>
          <br/>
          <p>
            {{ $t('warning.delete_post_action_cannot_be_undone') }}
          </p>
          <br/>
          <div class="float-right">
            <button class="btn btn-outline-danger float-right" v-on:click="onDeleteSubmit">{{ $t('button.delete') }}</button>
            <button class="btn btn-outline-secondary float-right" v-on:click="onDeleteCancel">{{ $t('button.cancel') }}</button>
          </div>

        </div>
      </div>
    </div>
    <!-- Modal Component -->
    <!--<b-modal :id="modalID" >
      <div class="d-block">Hello From My Modal!</div>
      <b-btn>Close Me</b-btn>
    </b-modal>-->
    <b-modal ref="postDeleteAttachmentConf" hide-footer :title="$t('label.attachment_delete')">
      <div class="d-block text-center">
        {{ $t('warning.delete_attachment_really_want_to') }}
      </div>
      <b-button class="mt-3" variant="" block @click="hideModal">{{ $t('button.cancel') }}</b-button>
      <b-button class="mt-3" variant="outline-danger" block @click="onAttachmentDelete()">{{ $t('button.delete') }}</b-button>
    </b-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import StreamComment from './StreamComment'
import StreamCommentForm from './StreamCommentForm'
import StreamPostForm from './StreamPostForm'

export default {
  props: ['streamOptions', 'post', 'comments'],
  components: {StreamComment, StreamCommentForm, StreamPostForm},
  name: 'stream-post',
  data () {
    return {
      showComments: false,
      curDeleteAttachment: null
    }
  },
  computed: {
    canEdit: function () {
      return this.post.permissions.canEdit
    },
    canDelete: function () {
      return this.post.permissions.canDelete
    },
    canCreateComment: function () {
      return true
    },
    sortedComments: function () {
      return Vue._.orderBy(this.comments, 'created', 'desc')
    },
    modalID: function () {
      return 'modal-delete' + this.post.nid
    },
    privacy: function () {
      let valueKeyInteger = parseInt(this.post.privacy.privacyDefault)
      return Vue._.filter(this.streamOptions.privacyOptionsAll, ['value', valueKeyInteger])[0]
    },
    streamLink: function () {
      return this.post.container.link + '?streamNode=' + this.post.nid
    }
  },
  methods: {
    editPost (event) {
      this.showComments = false
      // hide comments and show back
      this.$el.classList.add('flip-active')
      setTimeout(() => {
        this.$refs.streamPostForm.initializePost()
      }, 200)

      this.$refs.backDelete.classList.add('hide')
      this.$refs.backEdit.classList.remove('hide')
    },
    toggleComments (show) {
      this.showComments = !this.showComments

      if (this.showComments) {
        // let external modules know about new visible content
        this.$nextTick(() => {
          let eventUpdate = new Event('nm-stream:update')
          document.dispatchEvent(eventUpdate)
        })
      }
    },
    deletePost (event) {
      this.showComments = false
      // hide comments and show back
      setTimeout(() => {
        this.$el.classList.add('flip-active')
        // this.$refs.streamPostForm.resizePostFormContainer()

        this.$refs.backEdit.classList.add('hide')
        this.$refs.backDelete.classList.remove('hide')
      }, 200)
    },
    editCanceled (event) {
      this.$el.classList.remove('flip-active')
    },
    onDeleteSubmit () {
      let self = this
      let apiNodeDeleteUrl = this.$config.get('api.apiPostDeleteUrl').replace('%node', this.post.nid).replace('%token', this.streamOptions.token)

      // TODO show spinner
      Vue.axios.get(apiNodeDeleteUrl, {withCredentials: true}).then((response) => {
        if (response.data.status === 1) {
          // post deleted successfully
          self.$emit('stream-post-deleted', self.post)
          this.$el.classList.remove('flip-active')
        } else {
          // an error occured
          alert(this.$t('warning.error_occured_please_repeat_your_action'))
        }
      })
    },
    onDeleteCancel () {
      this.$el.classList.remove('flip-active')
    },
    onAttachmentDeleteConf (attachment) {
      this.$refs.postDeleteAttachmentConf.show()
      this.curDeleteAttachment = attachment
    },
    addUser (user) {
      this.$emit('stream-user-added', user)
    },
    addComment (comment) {
      this.showComments = true
      this.$emit('stream-comment-added', comment)
    },
    deleteComment (comment) {
      this.$emit('stream-comment-deleted', comment)
    },
    hideModal () {
      this.$refs.postDeleteAttachmentConf.hide()
      this.curDeleteAttachment = null
    },
    onAttachmentDelete () {
      let attachment = this.curDeleteAttachment
      let self = this
      let apiAttachmentDeleteUrl = this.$config.get('api.apiPostAttachmentDeleteUrl').replace('%node', self.post.nid).replace('%file', attachment.fid).replace('%token', this.streamOptions.token)
      Vue.axios.get(apiAttachmentDeleteUrl, {withCredentials: true}).then((response) => {
        // success ? response ready ;) - need to recheck
        let index = self.post.attachments.findIndex(x => x.fid === attachment.fid)
        self.post.attachments.splice(index, 1)
      })
      this.hideModal()
    }
  }
}
</script>

<style lang="scss" scoped>
  .card-flip {
    position: relative;
    &.flip-active {
      z-index: 999;
    }
    &.flip-active:hover {
      z-index: 1000;
    }
  }
  .stream-post {
    transition: 0.3s;
    &:hover {
      border: 1px solid #bbb;
    }

    text-align: left;
    .username {
      font-weight: normal;
    }
    .created {
      color: #aaa;
    }

    .stream-post-attachments {
      color: #333;

      ul {
        margin-top: 15px;
        list-style: none;
        padding: 0;
        margin-bottom: 0px;
      }

    }

    .body {
      padding-top: 1em;
      padding-bottom: 1.0em;
    }

    .comments-wrapper {
      border-top: 1px solid #eee;
      margin-top: 15px;
      margin-bottom: -15px;
      padding: 10px 0 15px;
      background-color: #f6f6f6;
      .stream-comment {
        margin: 5px 0;
      }
    }
    .stream-post-footer {
      height: 30px;
      a {
        position: absolute;
        background-color: white;
      }
    }

    .post-context {
      margin-top: -10px;
      span {
        border-bottom: 1px solid #efefef;
      }
    }

    .post-header {
    }

    .post-privacy-wrapper {
    }
    .post-privacy {
      top: 5px;
      position: relative;
    }

  }
</style>

<style lang="scss">
  .post-actions-dropdown {
    margin: 0 !important;

    button.dropdown-toggle {
      border: 0;
      background-color: transparent !important;
      // border: none !important;
      color: #111 !important;
    }

    button {
      background-color: transparent;
      border: none;
      color: #aaa;
      transform: rotate(-90deg);
      padding-top: 0;
      font-weight: bold;
      font-size: 20px;
      &:hover {
        background-color: transparent;
        // border: none;
        color: #111;
      }
      &.dropdown-toggle::after {
        display: none;
      }
    }
  }

  .stream-post-attachments {
    img.file-icon {
      vertical-align: top;
      margin-top: 2px;
    }
  }

  .hide {
    display: none;
  }

</style>
