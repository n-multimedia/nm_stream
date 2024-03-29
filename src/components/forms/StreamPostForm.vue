<template>
  <div class="stream-post-form card" v-on:dragover="dragOver">
    <div class="row">
      <div class="col-2">
        <transition name="fade">
          <img v-if="formActive" class="card-img-top rounded-circle" :src="author.avatarUrl" :key="formActive"
               :title="author.name"/>
        </transition>
      </div>
      <!-- Plugin -->
      <div class="active-plugin-content col-10" v-if="currentPluginTemplate">
        <keep-alive>
          <component v-bind:is="currentPluginTemplate" :param1="poll"
                     @dialogSubmit="pluginSubmitDialog($event)"
                     @dialogClose="pluginCloseDialog()"></component>
        </keep-alive>
      </div>
      <!-- Post Content -->
      <div class="col-10" v-if="!currentPluginTemplate">
        <stream-textarea
            ref="streamTextarea"
            @save="savePost"
            @reset="resetForm"
            @changeBody="changedBodyText"
            @changeFormActive="changedFormActive"
            :body-text="bodyText"
            :mentionMembers="mentionMembers"
            :form-active="formActive"
            :busyLoading="busyLoading"
            :textarea-placeholder="$t('placeholder.your_post_message')"
        ></stream-textarea>
        <!-- plugins -->
        <div class="row" v-if="formActive">
          <div class="col-12 plugins">
            <plugin-sticky v-if="canSetSticky" :param1="stickyValue"
                           @interface="stickyValue = $event"></plugin-sticky>
            <plugin-poll :param1="poll" @interface="currentPluginTemplate = $event"></plugin-poll>
          </div>
        </div>
        <div class="row stream-action-1">
          <transition name="fade">
            <div class="col-12 stream-attachments" v-if="formActive" :key="formActive">
              <vue-dropzone
                  ref="vueDropZone"
                  id="dropzone"
                  @vdropzone-processing="dropzoneQueueProcess"
                  @vdropzone-file-added="resizeDropArea"
                  @vdropzone-error="dropzoneError"
                  @vdropzone-success="vdropzoneSuccess"
                  @vdropzone-queue-complete="queueCompleted"
                  :options="dropzoneOptions" :disabled="busyLoading"></vue-dropzone>
              <div class="stream-post-attachments" ref="postAttachmentList"
                   v-if="editPost && editPost.attachments.length > 0">
                <font-awesome-icon :icon="['fa', 'file']"/>
                {{ $t('label.attachments') }}
                <div :key="attachment.fid" v-for="attachment in editPost.attachments">
                  <span v-html="attachment.download_link"></span>
                  <!-- todo delete attachment action -->
                  <a href="#" :title="$t('button.delete_attachment')" class="attachment-trash-delete"
                     v-if="attachment.permissions.canDelete"
                     v-on:click.prevent="onAttachmentDeleteConf(attachment)">
                    <font-awesome-icon :icon="['far', 'trash-alt']"/>
                  </a>
                </div>
              </div>
              <pulse-loader :loading="busyLoading" :color="busyLoadingColor"
                            :size="busyLoadingSize"></pulse-loader>
            </div>
          </transition>
        </div>
        <div class="row stream-action-2">
          <div class="col-12">
            <div class="row">
              <transition name="fade">
                <div class="col-12 action-buttons" v-if="formActive" :key="formActive">
                  <div class="row">
                    <div class="col-5">
                      <stream-privacy-widget :privacyOptions="privacyOptions" :privacyValue="privacyValue"
                                             @interface="privacyValue = $event"></stream-privacy-widget>
                    </div>
                    <div class="col-7">
                      <button class="btn btn-outline-primary stream-post-post float-right"
                              v-on:click="savePost" :disabled="this.bodyText.length < 1 || busyLoading">{{
                          $t('button.post')
                        }}
                      </button>
                      <button class="btn btn-outline-secondary stream-post-cancel float-right"
                              v-on:click="resetForm" :disabled="busyLoading">{{ $t('button.cancel') }}
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import StreamPrivacyWidget from '../widgets/StreamPrivacyWidget'
import PluginSticky from '../plugins/PluginSticky/PluginSticky'
import PluginPoll from '../plugins/PluginPoll/PluginPoll'
import PluginPollCreator from '../plugins/PluginPoll/PluginPollCreator'
import StreamTextarea from "@/components/widgets/StreamTextarea"; // for textarea

export default {
  props: ['streamOptions', 'editPost', 'mentionMembers'],
  name: 'stream-post-form',
  components: {
    StreamPrivacyWidget,
    vueDropzone: vue2Dropzone,
    PluginSticky,
    PluginPoll,
    PluginPollCreator,
    StreamTextarea
  },
  methods: {
    resizeTextarea(event) {
      this.resizeTextareaElement(event.target)
      this.resizePostFormContainer()
    },
    resizePostFormContainer() {
      // resizing post relevant for edit mode only
      if (this.editPost && this.$refs.vueDropZone) { // catch poll editing errors
        let dragzoneHeight = parseFloat(this.$refs.vueDropZone.$el.style.height)
        let attachmentsHeight = 0
        if (this.$refs.postAttachmentList) {
          attachmentsHeight = parseFloat(this.$refs.postAttachmentList.clientHeight)
        }
        if (this.$refs.streamTextarea) {
          this.$parent.$el.querySelector('.stream-post').style.height = (170 + dragzoneHeight + attachmentsHeight + this.$refs.streamTextarea.$el.querySelector('textarea').scrollHeight) + 'px'
        }
      }

      if (this.currentPluginTemplate) {
        this.$parent.$el.querySelector('.stream-post').style.height = (90 + this.$el.querySelector('.active-plugin-content').offsetHeight) + 'px'
      }
    },
    resizeTextareaElement(textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = (textarea.scrollHeight) + 'px'
    },
    savePost() {
      this.busyLoading = true

      let self = this

      let nodeData = {}
      nodeData.body = this.bodyText
      nodeData.privacy = this.privacyValue.value
      nodeData.sticky = this.stickyValue
      nodeData.poll = this.poll ? this.poll : undefined

      if (this.editPost) {
        let apiNodeUpdateUrl = this.$config.get('api.apiPostUpdateUrl').replace('%node', this.editPost.nid).replace('%token', this.streamOptions.token)

        // edit post => update
        Vue.axios.post(apiNodeUpdateUrl, nodeData, {withCredentials: true}).then((response) => {
          // ?? close form before request
          // or just show spinner instead
          // self.resetForm()

          if (response.data.status === 1) {
            self.editPost.body = response.data.nodeData.body
            self.editPost.body_formatted = response.data.nodeData.body_formatted
            self.editPost.privacy.privacyDefault = response.data.nodeData.privacy.privacyDefault
            self.editPost.sticky = response.data.nodeData.sticky
            self.editPost.poll = response.data.nodeData.poll
            self.editPost.changed = response.data.nodeData.changed

            this.$store.dispatch('updatePost', self.editPost)
            this.$root.$emit('nm-stream:node:save', self.editPost)

            // check for queued uploads
            if (self.$refs.vueDropZone.getQueuedFiles().length > 0) {
              // set editPost to update dropzone url
              // self.editPost = nodeData
              // self.$refs.vueDropZone.setOption('url', self.getPostUploadUrl(nodeData))
              // self.$refs.vueDropZone.setOption('url', self.getPostUploadUrl(nodeData))

              self.dropzoneResetAfterComplete = true
              // start uploading attachments
              self.$refs.vueDropZone.processQueue()
            } else {
              // refresh form values
              self.resetForm()
            }
          } else {
            // an error occured
            alert(this.$t('warning.error_occured_please_repeat_your_action'))
          }
        })
      } else {
        let apiNodeAddUrl = this.$config.get('api.apiPostAddUrl').replace('%token', this.streamOptions.token)

        // set container and context nodes from global streamOptions config
        nodeData.containerNID = this.streamOptions.containerNID
        nodeData.contextNID = this.streamOptions.contextNID

        // TODO show spinner
        Vue.axios.post(apiNodeAddUrl, nodeData, {withCredentials: true}).then((response) => {
          if (response.data.status === 1) {
            // post added successfully
            let nodeData = response.data.nodeData

            self.$emit('stream-post-added', nodeData)

            // check for queued uploads
            if (self.$refs.vueDropZone.getQueuedFiles().length > 0) {
              // set editPost to update dropzone url
              // self.editPost = nodeData
              self.$refs.vueDropZone.setOption('url', self.getPostUploadUrl(nodeData))

              self.dropzoneResetAfterComplete = true
              // start uploading attachments
              self.$refs.vueDropZone.processQueue()
            } else {
              self.resetForm()
            }
          } else {
            // an error occured
            alert(this.$t('warning.error_occured_please_repeat_your_action'))
          }
        })
      }
    },
    escPressed() {
      // prevent accidentally closing
      if (this.bodyText.length === 0) {
        this.resetForm()
      }
    },
    submitOnCtrlEnter(e) {
      // prüfe auf STRG
      if (e.ctrlKey) {
        this.savePost()
      }
    },
    resetForm() {
      // editPost
      if (this.editPost) {
        this.$emit('form-edit-canceled')
        this.$parent.$el.querySelector('.stream-post').style.height = 'auto'
      } else {
        this.formActive = false
        this.bodyText = ''
        let valueKeyInteger = parseInt(this.privacyDefault)
        this.privacyValue = Vue._.filter(this.privacyOptions, ['value', valueKeyInteger])[0]
        this.$refs.streamTextarea.$el.querySelector('textarea.stream-textbody').blur()
        this.$refs.streamTextarea.$el.querySelector('textarea.stream-textbody').style.height = 'auto'

        // Plugins Todo move to responsible Plugin
        this.stickyValue = 0
        this.poll = null
      }

      this.$refs.vueDropZone.removeAllFiles()

      this.busyLoading = false
    },
    dragOver() {
      // enable editor
      this.formActive = true
      this.$nextTick(() => {
        // react on drag over
        this.resizeDropArea()
      })
    },
    // issue https://github.com/enyo/dropzone/issues/578
    // adding unsupported file triggers function
    queueCompleted() {
      // trigger reset, if not editing only!
      // if (!this.editPost) {
      if (this.dropzoneQueueProcessing) {
        this.resetForm()
        this.dropzoneResetAfterComplete = false

        this.dropzoneQueueProcessing = false
      }

      // }
    },
    dropzoneQueueProcess() {
      this.dropzoneQueueProcessing = true
    },
    vdropzoneSuccess(file, response) {
      // update post
      this.$store.dispatch('updateAttachments', response.nodeData)
    },
    dropzoneError(file, message, xhr) {
      // update post
      console.error(file, message, xhr);
      alert(message.message + " (" + message.nid + ")")
    },
    resizeDropArea() {
      // resize droparea
      if (this.$refs.vueDropZone && this.$refs.vueDropZone.$el.style.height !== '250px') {
        this.$refs.vueDropZone.$el.style.height = '250px'
        // add label margin
        this.$refs.vueDropZone.$el.querySelector('div.dz-message').style.marginTop = '100px'
        // resize container
        this.resizePostFormContainer()
      }
    },
    updateAuthor() {
      this.author = this.streamOptions.loggedInUser

      // set post author if editing a post
      if (this.editPost) {
        this.author = this.editPost.user
      }
    },
    loadPrivacyOptions(privacyValues) {
      let postPrivacyOptions = []

      // prevent errors before values have not been initialized yet
      // TODO understand why ;)
      if (!Array.isArray(privacyValues) || !Array.isArray(this.streamOptions.privacyOptions)) {
        return postPrivacyOptions
      }

      let defaultPrivacyValue = null;
      if (this.editPost) {
        // add saved privacy setting to default option set
        let valueKeyInteger = parseInt(this.editPost.privacy.privacyDefault)
        defaultPrivacyValue = Vue._.filter(this.streamOptions.privacyOptionsAll, ['value', valueKeyInteger])[0]
      }

      this.streamOptions.privacyOptionsAll.forEach(element => {
        if (privacyValues.indexOf(element.value) > -1 || (defaultPrivacyValue && element.value == defaultPrivacyValue.value)) {
          postPrivacyOptions.push(element)
        }
      })

      return postPrivacyOptions
    },
    initializePost() {
      if (this.editPost) {
        this.formActive = true
        // clone body text to prevent two way binding
        this.bodyText = this.editPost.body
        this.stickyValue = parseInt(this.editPost.sticky)
        this.poll = this.editPost.poll

        // override privacy options
        this.privacyDefault = this.editPost.privacy.privacyDefault

        this.privacyOptions = this.loadPrivacyOptions(this.editPost.privacy.privacyOptions)
        let valueKeyInteger = parseInt(this.privacyDefault)
        this.privacyValue = Vue._.filter(this.privacyOptions, ['value', valueKeyInteger])[0]

        // resize textarea
        this.$nextTick(() => {
          // todo fix resize bug
          if (this.$refs.streamTextarea) {
            this.resizeTextareaElement(this.$refs.streamTextarea.$el.querySelector('textarea'))

            // init attachments
            this.$refs.vueDropZone.$el.style.height = '50px'
            this.$refs.vueDropZone.$el.querySelector('div.dz-message').style.marginTop = '10px'

            this.resizePostFormContainer()
          }
        })
      }
    },
    getPostUploadUrl(nodeData) {
      let returnUrl = ''
      if (!nodeData) {
        nodeData = this.editPost
      }
      if (nodeData) {
        returnUrl = this.$config.get('api.apiPostAttachmentUploadUrl').replace('%node', nodeData.nid).replace('%token', this.streamOptions.token)
      } else {
        returnUrl = this.$config.get('api.apiPostAttachmentUploadUrl').replace('%node', 0).replace('%token', this.streamOptions.token)
      }

      return returnUrl
    },
    getAutoProcessQueue() {
      // if (this.editPost) {
      //  return true
      // } else {
      //  return false
      // }
      return false
    },
    getDropZomeRemoveLabel() {
      if (this.editPost) {
        // hide because auto submitting updates
        return this.$t('label.nmDictHideFile')
      } else {
        // remove because files not updated yet
        return this.$t('label.dictRemoveFile')
      }
    },
    onAttachmentDeleteConf(attachment) {
      this.$emit('post-form-onAttachmentDeleteConf', attachment)
    },
    pluginSubmitDialog(poll) {
      this.poll = poll

      this.pluginCloseDialog()
    },
    pluginCloseDialog() {
      this.currentPluginTemplate = ''

      this.$nextTick(() => {
        this.resizeTextareaElement(this.$refs.streamTextarea.$el.querySelector('textarea'))
      })
    },
    changedBodyText(newVal) {
      this.bodyText = newVal
    },
    changedFormActive(newVal) {
      this.formActive = newVal
    }
  },
  watch: {},
  mounted: async function () {
    // /////////////////////////////
    // new post
    // /////////////////////////////
    this.privacyDefault = this.streamOptions.privacyDefault
    this.privacyOptions = this.streamOptions.privacyOptions
    this.loggedInUser = this.streamOptions.loggedInUser

    this.$nextTick(() => {
      this.$el.setAttribute('style', 'height:' + (this.$el.scrollHeight) + 'px;')
      this.$el.addEventListener('input', this.resizeTextarea)
    })

    // /////////////////////////////
    // an existing post was passed
    // /////////////////////////////
    // => edit Post
    // this.initializePost()

    // set privacy value
    if (!this.privacyValue) {
      if (this.editPost) {
        this.privacyOptions = this.loadPrivacyOptions(this.editPost.privacy.privacyOptions)
        this.privacyDefault = this.editPost.privacy.privacyDefault
      } else {
        this.privacyOptions = this.streamOptions.privacyOptions
        this.privacyDefault = this.streamOptions.privacyDefault
      }
      let valueKeyInteger = parseInt(this.privacyDefault)

      this.privacyValue = Vue._.filter(this.privacyOptions, ['value', valueKeyInteger])[0]
      // fallback to first/only private
      if (!this.privacyValue) {
        this.privacyValue = this.privacyOptions[0];
        this.privacyDefault = this.privacyValue.value;
      }
    }
    this.loggedInUser = this.streamOptions.loggedInUser

    // set post author for edit post or logged in user for the new post
    this.updateAuthor()

  },
  beforeDestroy() {
    this.$el.removeEventListener('input', this.resizeTextarea)
  },
  render() {
    return this.$slots.default[0]
  },
  data() {
    return {
      currentPluginTemplate: '',
      loggedInUser: null,
      author: null,
      privacyOptions: null,
      privacyDefault: null,
      formActive: false,
      bodyText: '',
      poll: null,
      privacyValue: null,
      stickyValue: 0,
      dropzoneResetAfterComplete: false,
      files: null,
      busyLoading: false,
      busyLoadingColor: '#888',
      busyLoadingSize: '10px',
      dropzoneQueueProcessing: false,
      dropzoneOptions: {
        url: this.getPostUploadUrl(),
        createImageThumbnails: false,
        autoProcessQueue: this.getAutoProcessQueue(),
        addRemoveLinks: true,
        acceptedFiles: this.streamOptions.acceptedFiles,
        maxFilesize: 20,
        dictDefaultMessage: this.$t('label.dictDefaultMessage'),
        dictFallbackMessage: this.$t('label.dictFallbackMessage'),
        // dictFallbackText: this.$t('label.dictFallbackText'),
        dictFileTooBig: this.$t('label.customdictFileTooBig'),
        dictInvalidFileType: this.$t('label.dictInvalidFileType'),
        // dictResponseError: this.$t('label.dictResponseError'),
        dictCancelUpload: this.$t('label.dictCancelUpload'),
        dictUploadCanceled: this.$t('label.dictUploadCanceled'),
        dictCancelUploadConfirmation: this.$t('label.dictCancelUploadConfirmation'),
        dictRemoveFile: this.getDropZomeRemoveLabel(),
        // dictRemoveFileConfirmation: this.$t('label.dictRemoveFileConfirmation'),
        dictMaxFilesExceeded: this.$t('label.dictMaxFilesExceeded')
        // dictFileSizeUnits: ''
      }
    }
  },
  computed: {
    canSetSticky: function () {
      // for existing posts
      if (this.editPost) {
        return this.editPost.permissions.canSetSticky
        // new posts
      } else {
        return this.streamOptions.permissions.canCreateStickyPost
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.stream-textbody {
  width: 100%;
}

.stream-post-form {
  text-align: left;
  // min-height: 190px;
  overflow: visible !important;
  position: relative;
  z-index: 1000;

  &.card {
    background-color: transparent;
    border: 0;
    height: auto !important;
  }
}

.stream-action-1 {
  .stream-attachment-dummybutton {
    display: inline-block;
    width: auto;
    max-width: 250px;
    height: 38px;
    padding: 8px 15px;
    background-color: #28a745;
    color: #fff;
    opacity: 0.8;
    transition: 0.3s;
    cursor: pointer;
  }

  .stream-attachment-dummybutton:hover {
    opacity: 1;
  }
}

.stream-action-2 {
  text-align: left;

  div.stream-post-cancel,
  div.stream-post-post {
    display: inline-block;
  }

  .action-buttons {
    text-align: right;
  }
}

button.stream-post-post,
button.stream-post-cancel {
  margin-left: 15px;
  margin-bottom: 15px;
}
</style>

<style lang="scss">
// load the variables
@import "../../assets/scss/bootstrap_custom.scss";
// @import "../../node_modules/bootstrap/scss/bootstrap.scss";

.multiselect {
  > ul,
  .multiselect__content-wrapper {
    transition: 0.3s;
    opacity: 0;
    visibility: hidden;
  }

  &.multiselect--active {
    .multiselect__content-wrapper {
      opacity: 1;
      visibility: visible;
    }
  }

  .multiselect__single {
    background-color: transparent;
  }

  .multiselect__single,
  .multiselect__option {
    img {
      margin-bottom: 3px;
    }
  }
}

.multiselect__option.multiselect__option--selected {
  background-color: #f1f1f1 !important; //hint: hier könnte man generell der wartbarkeit halber einfach die bs-variablen $grey etc nutzen
  color: #333;
}

.multiselect__option.multiselect__option--highlight {
  background-color: #f3f3f3 !important;
  border-right: 1px solid #005cbf90;
  color: #333;
}

.multiselect__option--selected.multiselect__option--highlight {
  background-color: #efefef !important;
  color: #333;
}

.multiselect__tags {
  padding-top: 7px;
  background-color: transparent;
}

.stream-action-1 {
  .stream-attachments {
    label {
      display: none;
    }

    .mt-3 {
      margin-left: 12px;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      cursor: pointer;
      opacity: 0;
      -ms-filter: 'alpha(opacity=0)';
    }
  }

  .custom-file {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  .dropzone {
    margin: 10px 0;
    min-height: 50px;
    height: 50px;
    padding: 0;
    transition: 0.5s;
    overflow-y: auto;

    .dz-message {
      margin: 10px;
      transition: 0.5s;
    }

    .dz-file-preview {
      display: block;
      background: none;
      min-height: 80px;
    }

    .dz-image {
      display: none;
    }

    .dz-remove {
      right: 15px;
    }

    .dz-success-mark,
    .dz-error-mark {
      top: 25%;
    }

    .dz-details {
      background-color: #333;
      padding: 10px;

      .dz-size {
        margin-bottom: 10px;
      }
    }

    .dz-error-message {
      top: 0;
    }
  }

  .dropzone.dz-drag-hover {
    border-color: $blue;
  }
}

.plugins {
  padding-right: 17px;
}

.atwho-ul {
  img {
    max-height: 100%;
    margin-right: 5px;
  }

  .atwho-li {
    padding: 3px 10px;
  }
}

</style>
