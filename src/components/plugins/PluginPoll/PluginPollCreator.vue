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
            <draggable tag="div" :list="poll.answers" class="" handle=".handle">
              <div
                class="row"
                v-for="(answer, index) in poll.answers"
                :key="answer.value"
              >
                <div class="col-10">
                  <i class="handle"><span></span></i>

                  <span class="text">{{ answer.name }} </span>

                  <input :placeholder="$t('plugins.poll.answer') + ' ' + (index + 1)"
                         ref="PollAnswerOptions"
                         @input="createNewInput(index)"
                         @focus="createNewInput(index)" v-on:keyup.enter="nextInput(index)"
                         v-model="poll.answers[index].text" type="text">
                </div>

                <div class="col-2">
                  <i class="close" @click="deleteInput(index)"></i>
                </div>
              </div>
            </draggable>
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
            <div class="col-10">
              <VueCtkDateTimePicker tabindex="1" locale="$i18n.locale" v-model="endDate"
                                    :label="$t('plugins.poll.pollEndDateLabel')"/>

              <small class="form-text text-muted">{{ $t('plugins.poll.pollEndDateDescription') }}</small>
            </div>
            <div class="col-2">

            </div>
          </div>
          <div class="row poll-actions">
            <div class="col-12">
              <button v-if="editPoll" @click="createPoll" class="btn btn-outline-primary" :disabled="!validate()">{{ $t('plugins.poll.save') }}</button>
              <button v-if="!editPoll" @click="createPoll" class="btn btn-outline-primary" :disabled="!validate()">{{ $t('plugins.poll.create') }}</button>
              <button @click="closePoll" class="btn btn-outline-secondary">{{ $t('plugins.poll.cancel') }}</button>
              <button @click="deletePoll" class="btn btn-outline-danger" :disabled="!editPoll">{{ $t('plugins.poll.delete') }}</button>
            </div>
          </div>
          <!--
          <div class="row poll-info" :class="{'success' : success === true, 'error' : success === false}"
               v-if="success !== null">
            <div class="col-12">
              <div v-if="success === true">{{ $t('plugins.poll.status_created') }}</div>
              <div v-if="success === false">{{ $t('plugins.poll.status_error') }}</div>
            </div>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'plugin-poll-creator',
  components: {
    draggable
  },
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
          {value: 0, text: ''},
          {value: 1, text: ''},
          {value: 2, text: ''}
        ],
        multiple: false
      },
      isValid: false,
      success: null,
      editPoll: null,
      endDate: null
    }
  },
  mounted () {
    if (this.param1) {
      this.poll = this.param1
      this.endDate = this.param1.endDate ? this.param1.endDate : null
      this.editPoll = this.poll // flag editing existing poll
    }

    if (this.poll.answers.length === 0) {
      this.addEntry('')
    }
  },
  methods: {
    addEntry (text) {
      const max = Math.max.apply(Math, this.poll.answers.map(function (o) { return o.value }))
      this.poll.answers.push({ value: max + 1, text: text })
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
    deletePoll () {
      this.$root.$emit('plugins:poll:creator:close')
      this.$emit('dialogSubmit', null)
      this.closePoll()
    },
    createPoll () {
      this.validate()
      if (this.isValid) {
        // delete empty answers
        this.poll.answers = this.poll.answers.filter((answer) => {
          if (answer.text.length > 0) {
            return answer
          }
        })

        let pollObject = {
          multiple: this.poll.multiple,
          question: this.poll.question,
          endDate: this.endDate,
          answers: []
        }

        this.poll.answers.forEach((val, index) => {
          const answer = {
            value: val.value,
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
      let answers = this.poll.answers.filter((answer) => {
        if (answer.text.length > 0) {
          return answer
        }
      })
      var count = answers.length
      if (count > 0) {
        this.isValid = true
      } else {
        this.isValid = false
      }

      return this.isValid
    },
    resetEndDate () {
      this.endDate = null
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
