<template>
  <div class="row poll-wrapper">
    <div class="col-12">
      <div class="row poll-title">
        <div class="col-12">
          <h3>{{ $t('plugins.poll.new_poll') }}</h3>
        </div>
      </div>
      <div class="row poll-container">
        <div class="col-12">
          <div class="row poll-question">
            <div class="col-10">
              <input v-model="poll.question" type="text" :placeholder="$t('plugins.poll.your_question')">
            </div>
          </div>
          <div class="poll-answers">
            <div v-for="(answer, index) in poll.answers" :key="index" class="row answer"
                 :style="{zIndex: poll.answers.length - index}">
              <div class="col-10">
                <input :placeholder="$t('plugins.poll.answer') + ' ' + (index + 1)" ref="PollAnswerOptions" @input="createNewInput(index)" @focus="createNewInput(index)" v-on:keyup.enter="nextInput(index)"
                       v-model="poll.answers[index].answer" type="text">
              </div>
              <div class="col-2">
                <a tabindex="2" href="#" :title="$t('plugins.poll.delete')" class="poll-trash-delete" @click="deleteInput(index)">
                  <font-awesome-icon :icon="['far', 'trash-alt']"/>
                </a>
              </div>
            </div>
          </div>
          <div class="row poll-options">
            <div class="col-12">
              <div class="custom-control custom-checkbox">
                <input tabindex="1" v-model="poll.multipleVotes" type="checkbox" class="checked custom-control-input" id="cb-multiple-votes">
                <label class="custom-control-label" for="cb-multiple-votes">{{ $t('plugins.poll.allow_multiple_votes') }}</label>
              </div>
            </div>
          </div>
          <div class="row poll-actions">
            <div class="col-12">
              <button @click="createPoll" class="btn btn-outline-primary ">{{ $t('plugins.poll.create') }}</button>
              <button @click="closePoll" class="btn btn-outline-secondary  ">{{ $t('plugins.poll.cancel') }}</button>
            </div>
          </div>
          <div class="row poll-info" :class="{'success' : success === true, 'error' : success === false}"
               v-if="success !== null">
            <div class="col-12">
              <div v-if="success === true">{{ $t('plugins.poll.status_created') }}</div>
              <div v-if="success === false">{{ $t('plugins.poll.status_error') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'poll-creator',
  props: {
    savePollUrl: {
      type: String
    },
    demo: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      poll: {
        question: '',
        answers: [
          {answer: ''}
        ],
        multipleVotes: false
      },
      isValid: false,
      success: null
    }
  },
  mounted () {
    if (this.poll.answers.length === 0) {
      this.poll.answers.push({answer: ''})
    }
  },
  methods: {
    createNewInput (index, ignoreLastEmpty) {
      if (this.poll.answers.length - 1 === index) {
        if (ignoreLastEmpty || this.poll.answers[index].answer) {
          this.poll.answers.push({answer: ''})
        }
      }
    },
    deleteInput (index) {
      if (index > 0 || this.poll.answers.length > 1) {
        this.poll.answers.splice(index, 1)
      }
    },
    nextInput (index) {
      // console.log(this.$refs.PollAnswerOptions)
      if (this.poll.answers.length - 1 === index) {
        this.createNewInput(index, true)
      }
      setTimeout(() => {
        this.$refs.PollAnswerOptions[index + 1].focus()
      }, 10)

      // console.log(event)
      // console.log(event.target.closest('div.row').nextElementSibling)
      // event.target.closest('div.row').nextElementSibling.focus()
    },
    closePoll() {
      this.$root.$emit('plugins:poll:creator:close')
      this.$emit('close')
    },
    createPoll() {
      this.validate()
      if (this.isValid) {
        // this.$root.$emit('plugins:poll:creator:create', this.poll)
        // create poll
        console.log('create poll ', this.poll)
        this.closePoll()
      } else {
        this.alert(false)
      }
    },
    resetPoll () {
      this.poll.multipleVotes = false
      this.poll.answers = []
      this.poll.answers.push({answer: ''})
      this.poll.answers.push({answer: ''})
      this.poll.answers.push({answer: ''})
      this.poll.answers.push({answer: ''})
      this.poll.question = ''
      this.isValid = false
    },
    validate () {
      this.poll.answers = this.poll.answers.filter((answer) => {
        if (answer.answer.length > 0) {
          return answer
        }
      })
      var count = this.poll.answers.length
      if (count > 1) {
        this.isValid = true
      } else {
        this.isValid = false
      }
    },
    alert (success) {
      this.success = success
      setTimeout(() => {
        this.success = null
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "./assets/poll.scss";
</style>
