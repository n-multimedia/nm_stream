<template>
  <!-- Card Flip -->
  <div class="card-flip">
    <div class="flip">
      <div class="front">
        <div class="stream-comment card">
          <div class="row">
            <div class="col-2">
              <img class="card-img-top rounded-circle" :src="user.avatarUrl" :title="user.name"/>
            </div>
            <div class="col-10">
              <div class="row">
                <div class="col-12">
                  <div v-if="canEdit || canDelete">
                    <b-dropdown text="..." class="post-actions-dropdown m-md-2 float-right" offset="-120">
                      <b-dropdown-item v-if="canEdit" v-on:click="editComment">{{ $t('button.edit') }}</b-dropdown-item>
                      <b-dropdown-item v-if="canDelete" v-on:click="deleteComment">{{ $t('button.delete') }}</b-dropdown-item>
                    </b-dropdown>
                  </div>
                  <div class="username"><a :href="user.profileUrl">{{user.name}}</a></div>
                  <div class="created">
                    <span :title="comment.created | moment('L LT')"> {{ comment.created | moment('from') }}</span></div>
                </div>
              </div>
              <div class="row">
                <div class="col-12 body">
                  <nl2br tag="p" :text="comment.body" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="back-edit" ref="backEdit">
        <div class="stream-comment card">
          <stream-comment-form ref="streamCommentForm"
            :streamOptions="streamOptions"
            :editComment="comment"
            v-on:form-edit-canceled="editCanceled()"
          >
          </stream-comment-form>
        </div>
      </div>
      <div class="back-delete" ref="backDelete">
        <div class="stream-post card">
          <h4>{{ $t('warning.delete_comment_action_cannot_be_undone') }}</h4>
          <br/>
          <p>
            {{ $t('warning.delete_comment_action_cannot_be_undone') }}
          </p>
          <div class="float-right">
            <button class="btn btn-outline-danger float-right">{{ $t('button.delete') }}</button>
            <button class="btn btn-outline-secondary float-right" v-on:click="onDeleteCancel()">{{ $t('button.cancel') }}</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StreamCommentForm from './StreamCommentForm'
export default {
  props: ['streamOptions', 'comment', 'user'],
  components: {StreamCommentForm},
  name: 'stream-comment',
  data () {
    return {
    }
  },
  computed: {
    canEdit: function () {
      return this.comment.permissions.canEdit
    },
    canDelete: function () {
      return this.comment.permissions.canDelete
    }
  },
  methods: {
    editComment (event) {
      this.$el.classList.add('flip-active')
      // hide comments and show back
      setTimeout(() => {
        this.$refs.streamCommentForm.resizeCommentFormContainer()
        this.$refs.backDelete.classList.add('hide')
        this.$refs.backEdit.classList.remove('hide')
      }, 200)
    },
    deleteComment (event) {
      console.log('delete comment')
      // hide comments and show back
      setTimeout(() => {
        this.$el.classList.add('flip-active')

        this.$refs.backEdit.classList.add('hide')
        this.$refs.backDelete.classList.remove('hide')
      }, 200)
    },
    onDeleteCancel (event) {
      this.$el.classList.remove('flip-active')
    },
    editCanceled (event) {
      this.$el.classList.remove('flip-active')
    }
  }
}
</script>

<style lang="scss" scoped>
  .stream-comment {
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
  }

</style>
