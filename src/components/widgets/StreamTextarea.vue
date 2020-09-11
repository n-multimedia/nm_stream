<template>
  <at-ta :members="mentionMembers" name-key="name" @at="atChanged">
    <template slot="item" slot-scope="s">
      <img :src="s.item.avatar" class="rounded-circle">
      <span v-text="s.item.realname"></span>
    </template>
    <textarea class="stream-textbody" name="body" v-on:keyup.esc="escPressed"
              v-on:keyup.enter="submitOnCtrlEnter" v-model="bodyText" v-model.lazy="bodyText"
              v-on:focus="formActive = true"
              :disabled="busyLoading" :placeholder="textareaPlaceholder"></textarea>
  </at-ta>
</template>

<script>
import AtTa from 'vue-at/dist/vue-at-textarea'

export default {
  name: 'StreamTextarea',
  components: {AtTa},
  props: ['mentionMembers', 'textareaPlaceholder', 'busyLoading', 'formActive', 'bodyText'],
  data() {
    return {
    }
  },
  methods: {
    atChanged(chunk) {
      if (chunk) {
        //trigger changed event to update model
        var event = new Event('change');
        this.$el.querySelector('textarea').dispatchEvent(event)
      }
    },
    escPressed() {
      // prevent accidentally closing
      if (this.bodyText.length === 0) {
        this.$emit('reset')
      }
    },
    submitOnCtrlEnter(e) {
      // prüfe auf STRG
      if (e.ctrlKey) {
        this.$emit('save')
      }
    },
  },
  watch: {
    bodyText: function(newVal, oldVal) { // watch it
      this.$emit('changeBody', newVal, oldVal)
    },
    formActive: function(newVal, oldVal) { // watch it
      this.$emit('changeFormActive', newVal, oldVal)
    }
  }

}
</script>

<style lang="scss">

  textarea.stream-textbody {
    background: none;
    border: 0;
    border-bottom: 2px solid #aaa;
    outline-style: none;
    resize: none;
    overflow: hidden !important;
    height: 30px;
    transition: 0.5s;
    width: 100%;
  }

  textarea.stream-textbody:hover,
  textarea.stream-textbody:active,
  textarea.stream-textbody:focus {
    border-bottom: 2px solid #333;
  }
</style>
