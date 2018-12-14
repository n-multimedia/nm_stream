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
                      <b-dropdown-item v-on:click="edit()" v-if="canEdit">t('Edit')</b-dropdown-item>
                      <b-dropdown-item v-if="canDelete">t('Delete')</b-dropdown-item>
                    </b-dropdown>
                  </div>
                  <div class="username"><a :href="user.profileUrl">{{user.name}}</a></div>
                  <div class="created">
                    <span :title="comment.created | moment('L LT')"> {{ comment.created | moment('from') }}</span></div>
                </div>
              </div>
              <div class="row">
                <div class="col-12 body">
                  {{comment.body}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="back">
        <div class="stream-comment card">
          <stream-comment-form ref="streamCommentForm"
            :streamOptions="streamOptions"
            :editComment="comment"
            v-on:edit-canceled="editCanceled()"
          >
          </stream-comment-form>
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
      canEdit: true,
      canDelete: true
    }
  },
  methods: {
    edit (event) {
      this.$el.classList.add('flip-active')
      this.$refs.streamCommentForm.resizeCommentFormContainer()
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
