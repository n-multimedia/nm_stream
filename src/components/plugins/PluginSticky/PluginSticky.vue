<script>
    import Plugin from '../Plugin'
    import {faAnchor} from '@fortawesome/free-solid-svg-icons'

    export default {
        extends: Plugin,
        name: 'plugin-sticky',
        data() {
            return {
                icon: faAnchor,
                title: this.$t('plugins.sticky.title'),
                sticky: this.param1
            }
        },
        computed: {
            // prop1 ~ sticky field
            isActive: function () {
                return this.sticky === 1
            }
        },
        methods: {
            onClickCallback() {
                if (this.sticky === 1) {
                    this.sticky = 0
                } else {
                    this.sticky = 1
                }
                this.$emit('interface', this.sticky)
            }
        }
    }
</script>

<style lang="scss">
    .plugin-sticky {
        .plugin-toolbar-btn {
            margin-left: 10px;
        }
    }
</style>
