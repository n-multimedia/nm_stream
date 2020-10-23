<template>
    <div class="stream-comment-from card">
        <div class="row">
            <div class="col-2">
                <transition name="fade">
                    <img v-if="formActive" class="card-img-top rounded-circle" :src="author.avatarUrl" :key="formActive"
                         :title="author.name"/>
                </transition>
            </div>
            <div class="col-10">
                <stream-textarea
                    @save="saveComment"
                    @reset="resetForm"
                    @changeBody="changedBodyText"
                    @changeFormActive="changedFormActive"
                    :body-text="bodyText"
                    :mentionMembers="mentionMembers"
                    :form-active="formActive"
                    :busyLoading="busyLoading"
                    :textarea-placeholder="$t('placeholder.your_comment_message')"
                ></stream-textarea>
                <transition name="fade">
                    <div class="row stream-action-2" :key="formActive">
                        <div class="col-12">
                            <div class="row">
                                <div class="col-12 action-buttons" v-if="formActive">
                                    <button class="btn btn-outline-primary stream-comment-post float-right"
                                            :disabled="this.bodyText.length < 1 || busyLoading"
                                            v-on:click="saveComment">{{ $t('button.post') }}
                                    </button>
                                    <button class="btn btn-outline-secondary stream-comment-cancel float-right"
                                            :disabled="busyLoading" v-on:click="resetForm">{{ $t('button.cancel') }}
                                    </button>
                                    <pulse-loader :loading="busyLoading" :color="busyLoadingColor"
                                                  :size="busyLoadingSize"></pulse-loader>
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
    import StreamTextarea from "@/components/widgets/StreamTextarea";
    export default {
        props: ['streamOptions', 'post', 'editComment', 'mentionMembers'],
        name: 'stream-comment-form',
        components: {StreamTextarea},
        methods: {
          atChanged(chunk) {
            if(chunk) {
              //trigger changed event to update model
              var event = new Event('change');
              this.$el.querySelector('textarea').dispatchEvent(event)
            }
          },
            resizeTextarea(event) {
                this.resizeTextareaElement(event.target)

                this.resizeCommentFormContainer()
            },
            resizeCommentFormContainer() {
                // resizing post relevant for edit mode only
                if (this.editComment) {
                    this.$parent.$el.querySelector('.stream-comment').style.height = (150 + this.$el.querySelector('textarea').scrollHeight) + 'px'
                }
            },
            saveComment() {
                this.busyLoading = true

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
                            self.editComment.body_formatted = response.data.commentData.body_formatted
                            self.editComment.body = response.data.commentData.body

                            // refresh form values
                            self.resetForm()
                        } else {
                            // an error occured
                            alert(this.$t('warning.error_occured_please_repeat_your_action'))
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
                            alert(this.$t('warning.error_occured_please_repeat_your_action'))
                        }
                    })
                }
            },
            resizeTextareaElement(textarea) {
                textarea.style.height = 'auto'
                textarea.style.height = (textarea.scrollHeight) + 'px'
            },
            escPressed() {
                // prevent accidentally closing
                if (this.bodyText.length === 0) {
                    this.resetForm()
                }
            },
            resetForm() {
                // editPost
                if (this.editComment) {
                    this.$emit('form-edit-canceled')
                    this.$parent.$el.querySelector('.stream-comment').style.height = 'auto'
                } else {
                    this.bodyText = ''
                    this.formActive = false

                    this.$el.querySelector('textarea.stream-textbody').blur()
                    this.$el.querySelector('textarea.stream-textbody').style.height = 'auto'
                }

                this.busyLoading = false
            },
            initializeComment() {
                if (this.editComment) {
                    // console.log('editpost', this.editPost)
                    this.formActive = true
                    this.bodyText = this.editComment.body
                    // resize textarea
                    this.$nextTick(() => {
                        this.resizeTextareaElement(this.$el.querySelector('textarea'))
                        this.resizeCommentFormContainer()
                    })
                }
            },
            updateAuthor() {
                this.author = this.streamOptions.loggedInUser

                // set post author if editing a post
                if (this.editComment) {
                    this.author = this.editComment.user
                }
            },
            changedBodyText(newVal) {
              this.bodyText = newVal
            },
            changedFormActive(newVal) {
              this.formActive = newVal
            }
        },
        mounted: function () {
            this.$nextTick(() => {
                this.$el.setAttribute('style', 'height:' + (this.$el.scrollHeight) + 'px;')
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
        beforeDestroy() {
            this.$el.removeEventListener('input', this.resizeTextarea)
        },
        render() {
            return this.$slots.default[0]
        },
        data() {
            return {
                formActive: false,
                busyLoading: false,
                busyLoadingColor: '#888',
                busyLoadingSize: '10px',
                author: null,
                bodyText: ''
            }
        }
    }
</script>

<style lang="scss" scoped>

    .stream-comment-from {
        text-align: left;

        &.card {
            background-color: transparent;
            border: 0;
            height: auto !important;
        }
    }

    button.stream-comment-cancel {
        margin-left: 15px;
        margin-right: 15px;
    }
</style>
