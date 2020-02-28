<script>
import Plugin from '../Plugin'
import {faPoll} from '@fortawesome/free-solid-svg-icons'

export default {
  extends: Plugin,
  name: 'plugin-poll',
  data () {
    return {
      icon: faPoll,
      activePluginComponent: '',
      title: this.$t('plugins.poll.title'),
      editPost: this.param1,
      editPoll: false
    }
  },
  computed: {
    isActive: function () {
      // check if a poll is attached already
      if (this.editPoll) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    onClickCallback () {
      this.activePluginComponent = 'PluginPollCreator'
      this.$emit('interface', this.activePluginComponent)
    }
  },
  mounted () {
    if (this.editPost && this.editPost.poll) {
      this.editPoll = this.editPost.poll // flag editing existing poll
    }
  }
}
</script>

<style lang="scss" >
  .plugin-poll {
    .plugin-toolbar-btn {
      zoom: 120%;
      margin-top: -1px;
      margin-right: 10px;
    }
  }
</style>
