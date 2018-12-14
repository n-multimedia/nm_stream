<template>
  <div class="stream-comment-from card">
    <div class="row">
      <div class="col-2">
        <transition name="fade">
          <img v-if="formActive" class="card-img-top rounded-circle" :src="author.avatarUrl" :key="formActive" :title="author.name" />
        </transition>
      </div>
      <div class="col-10">
        <textarea class="stream-comment-body" name="body" v-on:keyup.esc="resetForm" v-model="bodyText" v-on:focus="formActive = true" placeholder="t('Your comment')"></textarea>
        <transition name="fade">
          <div class="row stream-action-2" :key="formActive">
            <div class="col-12">
              <div class="row">
                <div class="col-12 action-buttons" v-if="formActive">
                  <button class="btn btn-outline-primary stream-comment-post float-right">t('Post')</button>
                  <button class="btn btn-outline-secondary stream-comment-cancel float-right" v-on:click="resetForm">t('Cancel')</button>
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
export default {
  props: ['streamOptions', 'editComment'],
  name: 'stream-comment-form',
  methods: {
    resizeTextarea (event) {
      this.resizeTextareaElement(event.target)
      this.resizeCommentFormContainer()
    },
    resizeCommentFormContainer () {
      // resizing post relevant for edit mode only
      if (this.editComment) {
        this.$parent.$el.querySelector('.stream-comment').style.height = (130 + this.$el.querySelector('textarea').scrollHeight) + 'px'
      }
    },
    resizeTextareaElement (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = (textarea.scrollHeight) + 'px'
    },
    resetForm () {
      // editPost
      if (this.editComment) {
        this.$emit('edit-canceled')
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
    this.initializeComment()

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
