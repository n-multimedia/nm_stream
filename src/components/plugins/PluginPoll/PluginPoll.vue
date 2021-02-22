<script>
    import Plugin from '../Plugin'
    import {faPoll} from '@fortawesome/free-solid-svg-icons'

    export default {
        extends: Plugin,
        name: 'plugin-poll',
        data() {
            return {
                icon: faPoll,
                activePluginComponent: '',
                title: this.$t('plugins.poll.title'),
                editPoll: this.param1
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
            onClickCallback() {
                this.activePluginComponent = 'PluginPollCreator'
                this.$emit('interface', this.activePluginComponent)
            }
        },
        mounted() {
        }
    }
</script>

<style lang="scss">
    .plugin-poll {
        .plugin-toolbar-btn {
            zoom: 120%;
            margin-top: -1px;
            margin-left: 10px;
        }
    }
</style>
