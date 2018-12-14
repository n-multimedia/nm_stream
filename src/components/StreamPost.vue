<template>
  <!-- Card Flip -->
  <div class="card-flip">
    <div class="flip">
      <div class="front">
        <div class="stream-post card">
          <div class="row">
            <div class="col-2">
              <img class="card-img-top rounded-circle" :src="post.user.avatarUrl" :title="post.user.name"/>
            </div>
            <div class="col-10">
              <div class="row">
                <div class="col-12">
                  <div v-if="this.privacy !== null" class="float-right">
                    <img class="post-privacy" :src="privacy.img" :alt="privacy.title" :title="privacy.title">
                  </div>
                  <div v-if="canEdit || canDelete">
                    <b-dropdown text="..." class="post-actions-dropdown m-md-2 float-right" offset="-120">
                      <b-dropdown-item v-on:click="edit()" v-if="canEdit">t('Edit')</b-dropdown-item>
                      <b-dropdown-item v-if="canDelete">t('Delete')</b-dropdown-item>
                    </b-dropdown>
                  </div>
                  <div class="username"><a :href="post.user.profileUrl">{{post.user.name}}</a></div>
                  <div class="created">
                    <span :title="post.created | moment('L LT')"> {{ post.created | moment('from') }}
                      <!--(am {{ post.created | moment("L") }} um {{ post.created | moment("LTS") }})--></span>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12 body">
                  {{post.body}}
                </div>
              </div>
              <div class="row">
                <div class="col-7">
                  <div class="stream-post-attachments" v-if="post.attachments.length > 0">t('Attachments')</div>
                  <div class="stream-post-footer">
                    <div v-if="sortedComments.length > 0">
                      <transition name="slide-fade">
                        <a href="#" v-if="!showComments" key="true" v-on:click.prevent="showComments = !showComments">t("Show
                          {{sortedComments.length}} comments")</a>
                        <a href="#" v-else key="false" v-on:click.prevent="showComments = !showComments">t("Hide
                          {{sortedComments.length}} comments")</a>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row comments-wrapper">
            <div class="col-10 offset-2">
              <stream-comment-form v-bind:streamOptions="streamOptions"></stream-comment-form>
              <transition name="fade">
                <div v-if="sortedComments.length > 0 && showComments === true">
                  <transition-group name="list">
                    <stream-comment v-for="comment in sortedComments"
                                    :streamOptions="streamOptions"
                                    :key="comment.cid"
                                    :comment="comment"
                                    :user="comment.user"/>
                  </transition-group>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      <div class="back">
        <div class="stream-post card">
          <stream-post-form ref="streamPostForm"
            :streamOptions="streamOptions"
            :editPost="post"
            v-on:edit-canceled="editCanceled()"
          >
          </stream-post-form>
        </div>
      </div>
    </div>
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
      canEdit: true,
      canDelete: true,
      privacy: null
    }
  },
  computed: {
    sortedComments: function () {
      if (!this.comments) {
        return []
      } else {
        return this.comments.slice().sort((a, b) => {
          return a.created < b.created
        })
      }
    }
  },
  mounted: function () {
    // set privacy value by ID
    this.loadPrivacyValue()
  },
  methods: {
    edit (event) {
      this.showComments = false
      // hide comments and show back
      setTimeout(() => {
        this.$el.classList.add('flip-active')
        this.$refs.streamPostForm.resizePostFormContainer()
      }, 200)
    },
    editCanceled (event) {
      this.$el.classList.remove('flip-active')
    },
    loadPrivacyValue () {
      this.privacy = Vue._.filter(this.streamOptions.privacyOptions, ['value', this.post.privacy.privacyDefault]).pop()
    }
  }
}
</script>

<style lang="scss" scoped>
  .card-flip {
    position: relative;
    &:hover {
      z-index: 999;
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
    .body {
      padding-top: 1em;
      padding-bottom: 1.5em;
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

    .post-privacy {
      padding: 20px 0;
    }
  }
</style>

<style lang="scss">
  .post-actions-dropdown {
    &.show {
      button {
        background-color: transparent !important;
        // border: none !important;
        color: #111 !important;
      }
    }

    button {
      background-color: transparent;
      border: none;
      color: #aaa;
      transform: rotate(-90deg);
      padding-tio: 0;
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

</style>
