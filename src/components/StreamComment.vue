<template>
  <div class="stream-comment card">
    <div class="row">
      <div class="col-2">
        <img class="card-img-top rounded-circle" :src="user.avatarUrl" :title="user.name"/>
      </div>
      <div class="col-10">
        <div class="row">
          <div class="col-12">
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
</template>

<script>
export default {
  props: ['comment', 'user'],
  name: 'stream-comment'
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
