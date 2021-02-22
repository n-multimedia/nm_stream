export default class StreamOptions {
    constructor() {
        //this.aggregated = '' // aggregated mode - available but not used
        this.privacyDefault = ''
        this.privacyOptions = []
        this.privacyOptionsAll = []
        this.permissions = []
        this.loggedInUser = ''
        this.containerNID = ''
        this.contextNID = ''
        this.token = ''
        this.timestamp = ''
        this.acceptedFiles = ''
        this.filterAvailableContexts = []
        this.filterAvailableUsers = []
    }
}
