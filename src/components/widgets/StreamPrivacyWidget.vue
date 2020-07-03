<template>
    <div class="stream-post-privacy-settings" v-if="privacyOptions.length > 0">
        <multiselect v-model="privacyValue" :options="privacyOptions" track-by="value" :option-height="104" :searchable="false" :show-labels="false" :allow-empty="allowEmpty" :placeholder="$t('button.select_privacy')" :disabled="busyLoading">
            <template slot="singleLabel" slot-scope="props"><img class="option__image" :src="props.option.img" :alt="props.option.title">
                <span class="option__desc"><span class="option__title">{{ props.option.title }}</span></span>
            </template>
            <template slot="option" slot-scope="props"><img class="option__image" :src="props.option.img" :alt="props.option.title" :disabled="busyLoading">
                <div class="option__desc"><span class="option__title">{{ props.option.title }}</span><span class="option__small">{{ props.option.desc }}</span></div>
            </template>
        </multiselect>
    </div>
</template>

<script>
  export default {
    name: 'StreamPrivacyWidget',
    props: ['privacyOptions', 'privacyValue'],
    data () {
      return {
        busyLoading: null,
        allowEmpty: null
      }
    },
    watch: {
      privacyValue: function (val) {
        // passt new value as soon as value has been changed
        this.$emit('interface', val)
      },
    }
  }
</script>

<style scoped lang="scss">
    div.stream-post-privacy-settings {
        position: relative;
        width: 185px;

        .multiselect {
            cursor: pointer;
            position: relative;

            .option__desc {
                display: inline-block;
                padding-left: 1rem;
            }
        }
        &:active,
        &:hover {
            z-index: 1001;
        }
    }

    div.stream-post-privacy-settings,
    div.stream-post-cancel,
    div.stream-post-post {
        display: inline-block;
    }
</style>
