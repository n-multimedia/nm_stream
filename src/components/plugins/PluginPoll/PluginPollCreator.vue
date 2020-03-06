<template>
  <div class="row poll-wrapper">
    <div class="col-12">
      <div class="row poll-title">
        <div class="col-12">
          <h4>{{ $t('plugins.poll.new_poll') }}</h4>
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
                       v-model="poll.answers[index].text" type="text">
              </div>
              <div class="col-2">
                <span tabindex="2" :title="$t('plugins.poll.delete')" class="poll-trash-delete" @click="deleteInput(index)">
                  <font-awesome-icon :icon="['far', 'trash-alt']"/>
                </span>
              </div>
            </div>
          </div>
          <div class="row poll-options">
            <div class="col-12">
              <div class="custom-control custom-checkbox">
                <input tabindex="1" v-model="poll.multiple" type="checkbox" class="checked custom-control-input" id="cb-multiple-votes">
                <label class="custom-control-label" for="cb-multiple-votes">{{ $t('plugins.poll.allow_multiple_votes') }}</label>
              </div>
            </div>
          </div>
          <div class="row poll-actions">
            <div class="col-12">
              <button v-if="editPoll" @click="createPoll" class="btn btn-outline-primary ">{{ $t('plugins.poll.save') }}</button>
              <button v-if="!editPoll" @click="createPoll" class="btn btn-outline-primary ">{{ $t('plugins.poll.create') }}</button>
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

export default {
  name: 'plugin-poll-creator',
  props: {
    savePollUrl: {
      type: String
    },
    demo: {
      type: Boolean,
      default: false
    },
    param1: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      poll: {
        question: '',
        answers: [
          {text: ''},
          {text: ''},
          {text: ''}
        ],
        multiple: false
      },
      isValid: false,
      success: null,
      editPoll: null
    }
  },
  mounted () {
    if (this.param1) {
      this.poll = this.param1
      this.editPoll = this.poll // flag editing existing poll
    }

    if (this.poll.answers.length === 0) {
      this.addEntry('')
    }
  },
  methods: {
    addEntry (text) {
      this.poll.answers.push({text})
    },
    createNewInput (index, ignoreLastEmpty) {
      if (this.poll.answers.length - 1 === index) {
        if (ignoreLastEmpty || this.poll.answers[index].text) {
          this.addEntry('')
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
    closePoll () {
      this.$root.$emit('plugins:poll:creator:close')
      this.$emit('dialogClose')
    },
    createPoll () {
      this.validate()
      if (this.isValid) {
        // this.$root.$emit('plugins:poll:creator:create', this.poll)
        // create poll
        // console.log('create poll ', this.poll)

        let pollObject = {
          multiple: this.poll.multiple,
          question: this.poll.question,
          answers: []
        }

        this.poll.answers.forEach((val, index) => {
          let answer = {
            value: index,
            text: val.text,
            votes: 0,
            selected: false
          }
          pollObject.answers.push(answer)
        })

        this.$emit('dialogSubmit', pollObject)
        this.$root.$emit('plugins:poll:creator:save', pollObject)
        this.closePoll()
      } else {
        this.alert(false)
      }
    },
    resetPoll () {
      this.poll.multiple = false
      this.poll.answers = []
      this.addEntry('')
      this.addEntry('')
      this.addEntry('')
      this.poll.question = ''
      this.isValid = false
    },
    validate () {
      this.poll.answers = this.poll.answers.filter((answer) => {
        if (answer.text.length > 0) {
          return answer
        }
      })
      var count = this.poll.answers.length
      if (count > 0) {
        this.isValid = true
      } else {
        this.isValid = false
        this.addEntry('')
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
