<template>
  <div class="plugin plugin-abstract">
    <span class="plugin-toolbar-btn" v-bind:class="{ active: isActive }" v-on:click="onClickCallback" :title="title">
      <font-awesome-icon :icon="icon"/>
    </span>
  </div>
</template>
<script>
import { faChessQueen } from '@fortawesome/free-solid-svg-icons'

export default {
  props: ['param1'],
  components: {},
  name: 'plugin',
  data () {
    return {
      icon: faChessQueen,
      label: 'Not implemented yet',
      title: 'Not implemented yet'
    }
  },
  computed: {
    isActive: false
  },
  methods: {
    onClickCallback () {
      alert('To be implemented')
    }
  }
}
</script>

<style lang="scss" scoped>
  .plugin {
    .active {
      color: #007bff;
    }
  }
  .plugin-toolbar-btn {
    float: right;
    cursor: pointer;
    &:hover {
      color: #007bff;
      filter: brightness(140%);
    }
  }
</style>
