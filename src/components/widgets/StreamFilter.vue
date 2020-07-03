<template>
    <form class="stream-filter-form">
        <div class="row">
            <div class="col-md-10 stream-filter-input-wrapper">
                <div class="row">
                    <div class="col" v-if="!streamOptions.contextNID">
                        <input type="text" v-model="context" class="stream-filter-context form-control" :placeholder="$t('filter.placeholder.context')">
                    </div>
                    <div class="col">
                        <input type="text" v-model="username" class="stream-filter-username form-control" :placeholder="$t('filter.placeholder.username')">
                    </div>
                    <div class="col">
                        <stream-privacy-widget :privacyValue="privacyValue" :privacyOptions="privacyOptions" @interface="privacyValue = $event"></stream-privacy-widget>
                    </div>
                </div>
            </div>
                <div class="col-md-2 stream-filter-action-wrapper">
                    <transition name="fade">
                        <a v-if="context || username || privacyValue" class="stream-filter-reset" href="#"
                           v-on:click="resetClick()">
                            <font-awesome-icon :icon="['fa', 'times']"/>
                        </a>
                    </transition>
                    <a class="stream-filter-submit" href="#" v-on:click="filterClick()">
                        <font-awesome-icon :icon="['fa', 'filter']"/>
                    </a>
                </div>
        </div>
    </form>
</template>

<script>
  import StreamPrivacyWidget from './StreamPrivacyWidget'

  export default {
    name: 'StreamFilter',
    props: ['streamOptions'],
    components: { StreamPrivacyWidget },
    data () {
      return {
        context: null,
        username: null,
        privacyValue: null,
        filterActive: null,
        privacyOptions: this.streamOptions.privacyOptions,
      }
    },
    methods: {
      filterClick () {
        const pv = (!this.privacyValue) ? null: this.privacyValue.value;
        const filter = {"context": this.context, "username": this.username, "privacy": pv}
        if(this.context || this.username || pv) {
          this.filterActive = true
          //emit filter event
          this.$root.$emit('widgets:filter:filter', filter)
        }
      },
      resetClick () {
        this.context = null
        this.username = null
        this.privacyValue = null

        if(this.filterActive) {
          this.$root.$emit('widgets:filter:filter', null)
          this.filterActive = null
        }

      }
    },
  }
</script>

<style scoped lang="scss">
    .stream-filter-form {
        margin-bottom: 15px;
    }

    a.stream-filter-submit {
        font-size: 2rem;
    }
    a.stream-filter-reset {
        font-size: 1.8rem;
        margin-right: 1.3rem;
    }

    .stream-filter-input-wrapper {
        padding: 0 !important;
    }

    .stream-filter-action-wrapper {
        padding: 0 !important;
        text-align: right;
    }

    .stream-filter-form {
        .col:first-child,
        .col:last-child {
            padding: 0;
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
</style>
