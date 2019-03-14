<template>
  <div class="stream-comment-from card">
    <div class="row">
      <div class="col-2">
        <transition name="fade">
          <img v-if="formActive" class="card-img-top rounded-circle" :src="author.avatarUrl" :key="formActive" :title="author.name" />
        </transition>
      </div>
      <div class="col-10">
        <textarea class="stream-comment-body" name="body" v-on:keyup.esc="resetForm" v-model="bodyText" v-on:focus="formActive = true" :placeholder="$t('placeholder.your_comment_message')"></textarea>
        <transition name="fade">
          <div class="row stream-action-2" :key="formActive">
            <div class="col-12">
              <div class="row">
                <div class="col-12 action-buttons" v-if="formActive">
                  <button class="btn btn-outline-primary stream-comment-post float-right" v-on:click="saveComment">{{ $t('button.post') }}</button>
                  <button class="btn btn-outline-secondary stream-comment-cancel float-right" v-on:click="resetForm">{{ $t('button.cancel') }}</button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>

import Vue from 'vue'

export default {
  props: ['streamOptions', 'post', 'editComment'],
  name: 'stream-comment-form',
  methods: {
    resizeTextarea (event) {
      this.resizeTextareaElement(event.target)
      this.resizeCommentFormContainer()
    },
    resizeCommentFormContainer () {
      // resizing post relevant for edit mode only
      if (this.editComment) {
        this.$parent.$el.querySelector('.stream-comment').style.height = (140 + this.$el.querySelector('textarea').scrollHeight) + 'px'
      }
    },
    saveComment () {
      let self = this

      let commentData = {}
      commentData.body = this.bodyText

      if (this.editComment) {
        let apiCommentUpdateUrl = this.$config.get('api.apiCommentUpdateUrl').replace('%comment', this.editComment.cid).replace('%token', this.streamOptions.token)
        // edit post => update
        Vue.axios.post(apiCommentUpdateUrl, commentData, {withCredentials: true}).then((response) => {
          // ?? close form before request
          // or just show spinner instead
          self.resetForm()

          if (response.data.status === 1) {
            self.editComment.body = commentData.body

            // refresh form values
            self.resetForm()
          } else {
            // an error occured
            // TODO error hadling
          }
        })
      } else {
        let apiComementAddUrl = this.$config.get('api.apiCommentAddUrl').replace('%node', this.post.nid).replace('%token', this.streamOptions.token)

        // TODO show spinner
        Vue.axios.post(apiComementAddUrl, commentData, {withCredentials: true}).then((response) => {
          self.resetForm()

          if (response.data.status === 1) {
            // post added successfully
            let commentData = response.data.commentData
            let userData = response.data.userData
            self.$emit('stream-comment-added', commentData)
            self.$emit('stream-user-added', userData)
          } else {
            // an error occured
            // TODO error hadling
          }
        })
      }
    },
    resizeTextareaElement (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = (textarea.scrollHeight) + 'px'
    },
    resetForm () {
      // editPost
      if (this.editComment) {
        this.$emit('form-edit-canceled')
        this.$parent.$el.querySelector('.stream-comment').style.height = 'auto'

        // restore post values
        this.initializeComment()
      } else {
        this.bodyText = ''
        this.formActive = false

        this.$el.querySelector('textarea.stream-comment-body').blur()
        this.$el.querySelector('textarea.stream-comment-body').style.height = 'auto'
      }
    },
    initializeComment () {
      if (this.editComment) {
        // console.log('editpost', this.editPost)
        this.formActive = true
        this.bodyText = this.editComment.body
        // resize textarea
        this.$nextTick(() => {
          this.resizeTextareaElement(this.$el.querySelector('textarea'))
        })
      }
    },
    updateAuthor () {
      this.author = this.streamOptions.loggedInUser

      // set post author if editing a post
      if (this.editComment) {
        this.author = this.editComment.user
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      this.$el.setAttribute('style', 'height:' + (this.$el.scrollHeight) + 'px;overflow-y:hidden;')
      this.$el.addEventListener('input', this.resizeTextarea)
    })

    // /////////////////////////////
    // an existing post was passed
    // /////////////////////////////
    // => edit Post
    // this.initializeComment()

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
      formActive: false,
      author: null,
      bodyText: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .stream-comment-body {
    width: 100%;
  }
  .stream-comment-from {
    text-align: left;
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

  button.stream-comment-cancel {
    margin-left: 15px;
    margin-right: 15px;
  }
</style>
