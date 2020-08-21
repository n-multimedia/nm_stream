<template>
    <form class="stream-filter-form" @submit.prevent="onSubmit">
        <div class="row">
            <div class="col-md-10 stream-filter-input-wrapper">
                <transition name="fade">
                        <div class="row" v-if="filterWidgetVisible">
                            <div class="col-md-4" v-if="!streamOptions.contextNID">
                                <vue-typeahead-bootstrap
                                        ref="context"
                                        :class="{'is-invalid': isInValidContext()}"
                                        class="stream-filter-context"
                                        v-model="contextSearch"
                                        :placeholder="$t('filter.placeholder.context')"
                                        :serializer="s => s.title"
                                        :data="contexts"
                                        @hit="contextSelected = $event"
                                />
                            </div>
                            <div :class="{'col-md-6': streamOptions.contextNID, 'col-md-4': !streamOptions.contextNID}">
                                <vue-typeahead-bootstrap
                                        ref="username"
                                        :class="{'is-invalid': isInValidUser()}"
                                        class="stream-filter-context"
                                        v-model="userSearch"
                                        :placeholder="$t('filter.placeholder.username')"
                                        :serializer="s => s.realname"
                                        :data="users"
                                        @hit="userSelected = $event"
                                />
                            </div>
                            <div :class="{'col-md-6': streamOptions.contextNID, 'col-md-4': !streamOptions.contextNID}">
                                <stream-privacy-widget :privacyValue="privacyValue" :privacyOptions="privacyOptions"
                                                       @interface="privacyValue = $event"></stream-privacy-widget>
                            </div>
                        </div>
                </transition>
            </div>
            <div class="col-md-2 stream-filter-action-wrapper">
                <transition name="fade">
                    <button type="reset" v-if="contextSearch || userSearch || privacyValue" class="stream-filter-reset" href="#"
                       v-on:click="resetClick()">
                        <font-awesome-icon :icon="['fa', 'times']"/>
                    </button>
                </transition>
                <button type="submit" class="stream-filter-submit" v-on:click="filterClick()"
                      :disabled="(isInValidContext() || isInValidUser() || (!contextSearch && !userSearch && !privacyValue)) && filterWidgetVisible">
                    <font-awesome-icon :icon="['fa', 'filter']"/>
                </button>
            </div>
        </div>
    </form>
</template>

<script>
    import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
    import StreamPrivacyWidget from './StreamPrivacyWidget'

    export default {
        name: 'StreamFilter',
        props: ['streamOptions'],
        components: {StreamPrivacyWidget, VueTypeaheadBootstrap},
        data() {
            return {
                contextSearch: null,
                contextSelected: null,
                contexts: this.streamOptions.filterAvailableContexts,
                userSearch: null,
                userSelected: null,
                users: this.streamOptions.filterAvailableUsers,
                username: null,
                privacyValue: null,
                filterActive: null,
                filterWidgetVisible: false,
                privacyOptions: this.streamOptions.privacyOptions,
            }
        },
        methods: {
            onSubmit() {

            },
            filterClick() {
                // show filter widget on first click
                if (!this.filterWidgetVisible) {
                    this.filterWidgetVisible = true;
                    return;
                }
                const pv = (!this.privacyValue) ? null : this.privacyValue.value;

                let filter = {}
                if (this.contextSelected) {
                    if (this.contextSearch == this.contextSelected.title) {
                        filter.context = this.contextSelected.nid;
                    }
                }
                if (this.userSelected) {
                    if (this.userSearch == this.userSelected.realname) {
                        filter.user = this.userSelected.uid;
                    }
                }
                if (pv) {
                    filter.privacy = pv;
                }

                if (this.contextSelected || this.userSelected || pv) {
                    this.filterActive = true
                    //emit filter event
                    this.$root.$emit('widgets:filter:filter', filter)
                }
            },
            isInValidContext() {
                return !!(this.contextSearch && (!this.contextSelected || this.contextSearch != this.contextSelected.title))
            },
            isInValidUser() {
                return !!(this.userSearch && (!this.userSelected || this.userSearch != this.userSelected.realname))
            },
            resetClick() {
                this.contextSelected = null
                this.userSelected = null
                this.privacyValue = null

                this.contextSearch = ''
                this.userSearch = ''

                if (this.filterActive) {
                    this.$root.$emit('widgets:filter:filter', null)
                    this.filterActive = null
                }

            }
        },
    }
</script>


<style lang="scss">
    .stream-filter-input-wrapper {
        padding: 0 !important;
        min-height: 38px;

        a.list-group-item {
            text-align: left;
            font-size: 1rem;
        }

        .form-control {
            min-height: 38px;
            margin-bottom: 5px !important;
        }

        .is-invalid {
            input.form-control {
                border-color: #d14836 !important;
            }
        }
    }

    .vbt-autcomplete-list {
        z-index: 1001 !important;
    }
</style>

<style scoped lang="scss">
    .stream-filter-form {
        margin-bottom: 15px;

        div.stream-post-privacy-settings {
            width: 100%;
        }
    }

    .stream-filter-submit {
        cursor: pointer;
        font-size: 2rem;
        border: 0;
        box-shadow: none;
        border: none;
        background: none;
        color: #337ab7;

        &:focus {
            color: #23527c;
        }

        &[disabled=disabled] {
            color: #ccc;
        }
    }

    .stream-filter-reset {
        font-size: 1.8rem;
        margin-right: 1.3rem;
        cursor: pointer;
        border: 0;
        box-shadow: none;
        border: none;
        background: none;
        color: #337ab7;

        &:focus {
            color: #23527c;
        }

        &[disabled=disabled] {
            color: #ccc;
        }
    }

    .stream-filter-input-wrapper {
        padding: 0 !important;
    }

    .stream-filter-action-wrapper {
        padding: 0 !important;
        text-align: right;
    }

    .stream-filter-form {
        .col-md-4 {
            padding-left: 5px;
            padding-right: 5px;
        }

        .col-md-4:first-child,
        .col-md-4:last-child {
            padding: 0;
        }

        .col-md-6:first-child {
            padding: 0;
        }
        .col-md-6:last-child {
            padding-left: 15px;
        }

    }

    @media (max-width: 768px) {
        .stream-filter-form {
            .col-md-4,
            .col-md-6 {
                padding: 0 !important;
            }
        }
    }


    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }


</style>
