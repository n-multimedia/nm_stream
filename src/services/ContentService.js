import Vue from 'vue'

export default class ContentService {
  constructor () {
    // todo configuration
    this.initUrl = 'https://dev1.div.onlinekurslabor.de/api/v2.0/nm_stream/node/15347/initialize'

    this.posts = {}
    this.users = {}
    this.comments = {}
    this.streamOptions = {}
    this.initializeContent()
  }

  initializeContent () {
    /*
    Vue.axios.get(this.initUrl, {withCredentials: true}).then((response) => {
      self.posts = response.data.stream.posts
      self.users = response.data.stream.users
      self.comments = response.data.stream.comments
      self.streamOptions = response.data.stream.streamOptions

      Vue.$emit('content:updated', response.data.stream)
    })
    */

    /*
    var xhr = new XMLHttpRequest()
    var self = this
    xhr.open('GET', this.initUrl)
    var response = {}
    xhr.onload = function () {
      var response = JSON.parse(xhr.responseText)
      self.posts = response.stream.posts
      self.users = response.stream.users
      self.comments = response.stream.comments
      self.streamOptions = response.stream.streamOptions
    }
    xhr.withCredentials = true
    xhr.send()

    */

    /*
    this.posts = require('../assets/jsonSample.json').posts
    this.users = require('../assets/jsonSample.json').users
    this.comments = require('../assets/jsonSample.json').comments
    this.streamOptions = new StreamOptions()
    this.streamOptions.containerNID = require('../assets/jsonSample.json').stream.containerNID
    this.streamOptions.contextNID = require('../assets/jsonSample.json').stream.contextNID
    this.streamOptions.privacyOptions = require('../assets/jsonSample.json').stream.privacyOptions
    this.streamOptions.privacyDefault = require('../assets/jsonSample.json').stream.privacyDefault
    this.streamOptions.loggedInUser = this.getUser(require('../assets/jsonSample.json').stream.loggedInUser)
    var response = {}
    response.posts = this.posts
    response.users = this.users
    response.comments = this.comments
    response.streamOptions = this.users
    return response
    */

    /*
    var xhr = new XMLHttpRequest()
    var self = this
    xhr.open('GET', apiURL + self.currentBranch)
    xhr.onload = function () {
      self.commits = JSON.parse(xhr.responseText)
      console.log(self.commits[0].html_url)
    }
    xhr.send()
    */
  }

  getUpdate () {
    return {}
  }

  addPost () {
    return {}
  }

  updatePost () {
    return {}
  }

  updateComment () {
    return {}
  }

  fileDelete () {
    return {}
  }

  getUser (uid) {
    return Vue._.find(this.users, ['uid', uid])
  }
}
