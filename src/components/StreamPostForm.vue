<template>
  <div class="stream-post-from card" v-on:dragover="dragOver">
    <div class="row">
      <div class="col-2">
        <transition name="fade">
          <img v-if="formActive" class="card-img-top rounded-circle" :src="author.avatarUrl" :key="formActive" :title="author.name"/>
        </transition>
      </div>
      <div class="col-10">
        <textarea class="stream-post-body" name="body" v-on:keyup.esc="resetForm" v-on:focus="formActive = true" v-model="bodyText" :placeholder="$t('placeholder.your_post_message')"></textarea>
        <div class="row stream-action-1">
          <transition name="fade">
            <div class="col-12 stream-attachments" v-if="formActive" :key="formActive">
              <!--<input class="stream-post-attachment" type="file" name="files[]">-->
              <!-- PostTools -->
              <!-- Styled -->
              <!--<span class="stream-attachment-dummybutton">
                <span><font-awesome-icon :icon="['fa', 'PlusSquare']"/> t('Add Attachment')</span>
                <b-form-file v-model="files" multiple></b-form-file>
              </span>
              <div v-if="files && files.length > 0">
                <div class="mt-3" v-for="file in files" :key="file.name">{{file && file.name}}</div>
              </div>-->
              <vue-dropzone
                ref="vueDropZome"
                id="dropzone"
                :options="dropzoneOptions"></vue-dropzone>
            </div>
          </transition>
        </div>
        <div class="row stream-action-2">
          <div class="col-12">
            <div class="row">
              <transition name="fade">
                <div class="col-12 action-buttons" v-if="formActive" :key="formActive">
                  <div class="stream-post-privacy-settings" v-if="privacyOptions.length > 0">
                    <multiselect v-model="privacyValue" :options="privacyOptions" track-by="value" :option-height="104" :show-labels="false" :allow-empty="false" :placeholder="$t('button.select_privacy')">
                      <template slot="singleLabel" slot-scope="props"><img class="option__image" :src="props.option.img" :alt="props.option.title">
                        <span class="option__desc"><span class="option__title">{{ props.option.title }}</span></span>
                      </template>
                      <template slot="option" slot-scope="props"><img class="option__image" :src="props.option.img" :alt="props.option.title">
                        <div class="option__desc"><span class="option__title">{{ props.option.title }}</span><span class="option__small">{{ props.option.desc }}</span></div>
                      </template>
                    </multiselect>
                  </div>
                  <button class="btn btn-outline-primary stream-post-post float-right">{{ $t('button.post') }}</button>
                  <button class="btn btn-outline-secondary stream-post-cancel float-right" v-on:click="resetForm">{{ $t('button.cancel') }}</button>
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

export default {
  props: ['streamOptions', 'editPost'],
  name: 'stream-post-form',
  components: {vueDropzone: vue2Dropzone},
  methods: {
    resizeTextarea (event) {
      this.resizeTextareaElement(event.target)
      // console.log(this.$parent.$el.querySelector('.stream-post'))
      // console.log('height', this.$parent.$el.style.height + event.target.style.height)
      // this.$parent.$el.querySelector('.stream-post').style.height = (this.$parent.$el.style.height + event.target.style.height) + 'px'
      // console.log(this.$parent.$el.querySelector('.stream-post').style.height)
      this.resizePostFormContainer()
    },
    resizePostFormContainer () {
      // resizing post relevant for edit mode only
      if (this.editPost) {
        let dragzoneHeight = parseFloat(this.$refs.vueDropZome.$el.style.height)
        this.$parent.$el.querySelector('.stream-post').style.height = (150 + dragzoneHeight + this.$el.querySelector('textarea').scrollHeight) + 'px'
      }
    },
    resizeTextareaElement (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = (textarea.scrollHeight) + 'px'
    },
    resetForm () {
      // editPost
      if (this.editPost) {
        this.$emit('edit-canceled')
        this.$parent.$el.querySelector('.stream-post').style.height = 'auto'
        // restore post values
        this.initializePost()
      } else {
        this.formActive = false
        this.bodyText = ''
        this.privacyValue = Vue._.filter(this.privacyOptions, ['value', this.privacyDefault])
        this.$el.querySelector('textarea.stream-post-body').blur()
        this.$el.querySelector('textarea.stream-post-body').style.height = 'auto'
      }

      this.$refs.vueDropZome.removeAllFiles()
    },
    dragOver (event) {
      // enable editor
      this.formActive = true
      this.$nextTick(() => {
        // react on drag over
        if (this.$refs.vueDropZome.$el.style.height !== '250px') {
          // resize droparea
          this.$refs.vueDropZome.$el.style.height = '250px'
          // add label margin
          this.$refs.vueDropZome.$el.querySelector('div.dz-message').style.marginTop = '100px'
          // resize container
          this.resizePostFormContainer()
        }
      })
    },
    updateAuthor () {
      this.author = this.streamOptions.loggedInUser

      // set post author if editing a post
      if (this.editPost) {
        this.author = this.editPost.user
      }
    },
    loadPrivacyOptions (privacyValues) {
      let postPrivacyOptions = []

      // prevent errors before values have not been initialized yet
      // TODO understand why ;)
      if (!Array.isArray(privacyValues) || !Array.isArray(this.streamOptions.privacyOptions)) {
        return postPrivacyOptions
      }

      this.streamOptions.privacyOptions.forEach(element => {
        if (privacyValues.indexOf(element.value) > -1) {
          postPrivacyOptions.push(element)
        }
      })
      return postPrivacyOptions
    },
    initializePost () {
      if (this.editPost) {
        // console.log('editpost', this.editPost)
        this.formActive = true
        this.bodyText = this.editPost.body

        // override privacy options
        this.privacyDefault = this.editPost.privacy.privacyDefault
        this.privacyOptions = this.loadPrivacyOptions(this.editPost.privacy.privacyOptions)
        this.privacyValue = Vue._.filter(this.privacyOptions, ['value', this.privacyDefault])
        // resize textarea
        this.$nextTick(() => {
          this.resizeTextareaElement(this.$el.querySelector('textarea'))

          // init attachments
          this.$refs.vueDropZome.$el.style.height = '50px'
          this.$refs.vueDropZome.$el.querySelector('div.dz-message').style.marginTop = '10px'
        })
      }
    }
  },
  watch: {
    streamOptions: function () {
      if (!this.privacyValue) {
        if (this.editPost) {
          this.privacyOptions = this.loadPrivacyOptions(this.editPost.privacy.privacyOptions)
          this.privacyDefault = this.editPost.privacy.privacyDefault
        } else {
          this.privacyOptions = this.streamOptions.privacyOptions
          this.privacyDefault = this.streamOptions.privacyDefault
        }
        this.privacyValue = Vue._.filter(this.privacyOptions, ['value', this.privacyDefault])
      }
      this.loggedInUser = this.streamOptions.loggedInUser

      // set proper author
      this.updateAuthor()
    }
  },
  mounted: function () {
    // /////////////////////////////
    // new post
    // /////////////////////////////
    this.privacyDefault = this.streamOptions.privacyDefault
    this.privacyOptions = this.streamOptions.privacyOptions
    this.loggedInUser = this.streamOptions.loggedInUser

    this.$nextTick(() => {
      this.$el.setAttribute('style', 'height:' + (this.$el.scrollHeight) + 'px;overflow-y:hidden;')
      this.$el.addEventListener('input', this.resizeTextarea)
    })

    // /////////////////////////////
    // an existing post was passed
    // /////////////////////////////
    // => edit Post
    this.initializePost()

    // set post author for edit post or logged in user for the new post
    this.updateAuthor()
  },
  beforeDestroy () {
    this.$el.removeEventListener('input', this.resizeTextarea)
  },
  render () {
    return this.$slots.default[0]
  },
  data () {
    return {
      loggedInUser: null,
      author: null,
      privacyOptions: null,
      privacyDefault: null,
      formActive: false,
      bodyText: '',
      privacyValue: null,
      files: null,
      dropzoneOptions: {
        url: 'nirvana',
        createImageThumbnails: false,
        addRemoveLinks: true,
        maxFilesize: 20,
        headers: {'My-Awesome-Header': 'header value'},
        dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> " + this.$t('label.upload_files')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .stream-post-body {
    width: 100%;
  }
  .stream-post-from {
    text-align: left;
    // min-height: 190px;
    overflow: visible !important;
    position: relative;
    z-index: 1000;
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
    div.stream-post-privacy-settings {
      position: relative;
      width: 250px;
      .multiselect {
        cursor: pointer;
        position: relative;
        .option__desc {
          display: inline-block;
        }
      }
    }
    div.stream-post-privacy-settings,
    div.stream-post-cancel,
    div.stream-post-post {
      display: inline-block;
    }
    .action-buttons {
      text-align: right;
    }
  }
  .card {
    background-color: transparent;
    border: 0;
    height: auto !important;
  }
  textarea {
    background: none;
    border: 0;
    border-bottom: 2px solid #aaa;
    outline-style: none;
    resize: none;
    overflow: hidden;
    height: 30px;
    transition: 0.5s;
  }
  textarea:hover,
  textarea:active,
  textarea:focus {
    border-bottom: 2px solid #333;
  }
  button.stream-post-cancel {
    margin-left: 15px;
    margin-right: 15px;
  }
</style>

<style lang="scss" >
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
    .multiselect__single,
    .multiselect__option {
      img {
        margin-bottom: 3px;
      }
    }
  }
  .multiselect__option.multiselect__option--selected {
    background-color: #f1f1f1 !important;
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
      }
      .dz-error-message {
        top: 0;
      }
    }
    .dropzone.dz-drag-hover {
      border-color: #007bff;
    }
  }
</style>
