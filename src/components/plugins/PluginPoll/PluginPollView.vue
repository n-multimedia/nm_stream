<template>
    <div class="vue-poll">
        <h4 class="qst" v-html="question"></h4>
        <div class="ans-cnt">
            <template v-if="!finalResults && !visibleResults">
                <div v-for="(a, index) in answersOptions" :key="index"
                     :class="{ ans: true, [a.custom_class]: (a.custom_class) }">
                    <div :class="{ 'ans-no-vote noselect': true, active: a.selected }"
                         @click.prevent="handleVote(a)">
                        <span class="txt" v-html="a.text"></span>
                    </div>
                </div>
            </template>
            <template v-else>
                <div v-for="(a, index) in calcAnswers" :key="index"
                     :class="{ ans: true, [a.custom_class]: (a.custom_class) }">
                    <div class="ans-voted" :class="{ final: finalResults, 'ans-voted': true, selected: a.selected }" >
                        <span v-if="a.percent" class="percent" v-text="a.percent"></span>
                        <span class="txt" v-html="a.text"></span>
                    </div>
                    <span v-if="finalResults" :class="{ bg: finalResults, selected: mostVotes == a.votes }" :style="{ width: a.percent }"></span>
                    <span v-else class="bg" :style="{ width: visibleResults ? a.percent : '0%' }"></span>
                </div>
            </template>
        </div>
        <div class="votes" v-if="showTotalVotes && (visibleResults || finalResults)"
             v-text="totalVotesFormatted + ' ' + labelVotes"></div>
        <template v-if="!finalResults && !visibleResults && totalSelections > 0">
            <button href="#" @click.prevent="handleSubmit" class="btn btn-primary submit-button"
                    v-text="submitButtonText"></button>
        </template>

    </div>
</template>

<script>

    export default {
        name: 'plugin-poll-view',
        props: {
            question: {
                type: String,
                required: true
            },
            answers: {
                type: Array,
                required: true
            },
            showResults: {
                type: Boolean,
                default: false
            },
            showTotalVotes: {
                type: Boolean,
                default: true
            },
            finalResults: {
                type: Boolean,
                default: false
            },
            multiple: {
                type: Boolean,
                default: false
            },
            submitButtonText: {
                type: String,
                default: function () {
                    return this.$t('plugins.poll.submit')
                }
            },
            customId: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                visibleResults: JSON.parse(this.showResults),
                answersOptions: [{}]
            }
        },
        computed: {
            totalVotes() {
                let totalVotes = 0
                this.answers.filter(a => {
                    if (!isNaN(a.votes) && a.votes > 0) {
                        totalVotes += parseInt(a.votes)
                    }
                })
                return totalVotes
            },
            totalVotesFormatted() {
                return this.totalVotes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            },
            labelVotes() {
                if (this.totalVotes === 1) {
                    return this.$t('plugins.poll.vote')
                } else {
                    return this.$t('plugins.poll.votes')
                }
            },
            mostVotes() {
                let max = 0
                this.answers.filter(a => {
                    if (!isNaN(a.votes) && a.votes > 0 && a.votes >= max) {
                        max = a.votes
                    }
                })

                return max
            },
            calcAnswers() {
                if (this.totalVotes === 0) {
                    return this.answers.map(a => {
                        a.percent = '0%'
                        return a
                    })
                }

                // Calculate percent
                return this.answers.filter(a => {
                    if (!isNaN(a.votes) && a.votes > 0) {
                        a.percent = (Math.round((parseInt(a.votes) / this.totalVotes) * 100)) + '%'
                    } else {
                        a.percent = '0%'
                    }
                    return a
                })
            },
            totalSelections() {
                return this.answersOptions.filter(a => a.selected).length
            }
        },
        mounted() {
            if (this.totalVotes === 0) {
                this.answersOptions = this.answers.map(a => {
                    a.percent = '0%'
                    return a
                })
            }

            // Calculate percent
            this.answersOptions = this.answers.filter(a => {
                if (!isNaN(a.votes) && a.votes > 0) {
                    a.percent = (Math.round((parseInt(a.votes) / this.totalVotes) * 100)) + '%'
                } else {
                    a.percent = '0%'
                }
                return a
            })

        },
        methods: {
            handleSubmit() {
                let arSelected = []
                this.answersOptions.filter(a => {
                    if (a.selected) {
                        a.votes++
                        arSelected.push({value: a.value, votes: a.votes})
                    }
                })

                this.visibleResults = true

                let obj = {arSelected: arSelected, totalVotes: this.totalVotes}

                if (this.customId) {
                    obj.customId = this.customId
                }


                // show instant result
                this.answers = this.answersOptions

                this.$emit('addvote', obj)
            },
            deselectAll() {
                return this.answersOptions.map(a => {
                    a.selected = false
                    return a
                })
            },
            handleVote(a) {
                if (this.multiple) {
                    // multiple
                    if (a.selected === undefined) {
                        console.log("Please add 'selected: false' on the answer object")
                    }

                    a.selected = !a.selected

                } else {
                    // set special item active
                    if (a.selected) {
                        this.deselectAll()
                    } else {
                        this.deselectAll()
                        a.selected = true
                    }
                }
                return
            }
        }
    }

</script>

<style>
    .vue-poll {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }

    .vue-poll .noselect {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .vue-poll .qst {
        font-weight: normal;
    }

    .vue-poll .ans-cnt {
        margin: 20px 0;
    }

    .vue-poll .ans-cnt .ans {
        position: relative;
        margin-top: 10px;
    }

    .vue-poll .ans-cnt .ans:first-child {
        margin-top: 0;
    }

    .vue-poll .ans-cnt .ans-no-vote {
        text-align: center;
        border: 2px solid #77C7F7;
        box-sizing: border-box;
        border-radius: 5px;
        cursor: pointer;
        padding: 5px 0;
        transition: background .2s ease-in-out;
        -webkit-transition: background .2s ease-in-out;
        -moz-transition: background .2s ease-in-out;
    }

    .vue-poll .ans-cnt .ans-no-vote .txt {
        color: #77C7F7;
        transition: color .2s ease-in-out;
        -webkit-transition: color .2s ease-in-out;
        -moz-transition: color .2s ease-in-out;
    }

    .vue-poll .ans-cnt .ans-no-vote.active {
        background: #77C7F7;
    }

    .vue-poll .ans-cnt .ans-no-vote.active .txt {
        color: #fff;
    }

    .vue-poll .ans-cnt .ans-voted {
        padding: 5px 0;
    }

    .vue-poll .ans-cnt .ans-voted .percent,
    .vue-poll .ans-cnt .ans-voted .txt {
        position: relative;
        z-index: 1;
    }

    .vue-poll .ans-cnt .ans-voted .percent {
        font-weight: bold;
        min-width: 51px;
        display: inline-block;
        margin: 0 10px;
    }

    .vue-poll .ans-cnt .ans-voted.selected .txt:after {
        content: '✔';
        margin-left: 10px;
    }

    .vue-poll .ans-cnt .ans .bg {
        position: absolute;
        width: 0%;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 0;
        background-color: #E1E8ED;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        transition: all .3s cubic-bezier(0.5, 1.2, .5, 1.2);
        -webkit-transition: all .3s cubic-bezier(0.5, 1.2, .5, 1.2);
        -moz-transition: all .3s cubic-bezier(0.5, 1.2, .5, 1.2);
    }

    .vue-poll .ans-cnt .ans .bg.selected {
        background-color: #77C7F7;
    }

    .vue-poll .votes {
        font-size: 14px;
        color: #8899A6
    }

    .vue-poll .submit {
        display: block;
        text-align: center;
        margin: 0 auto;
        max-width: 80px;
        text-decoration: none;
        background-color: #41b882;
        color: #fff;
        padding: 10px 25px;
        border-radius: 5px;
    }

    .vue-poll .submit-button {
        margin: auto;
        display: block;
    }

    .vue-poll .bg.selected {
        opacity: 0.7;
    }

</style>
