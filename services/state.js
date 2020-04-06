
/**
 * Keep some application state in memory
 */
class ApplicationState {

  constructor() {
    this.accessToken = undefined
    this.actionLog = []
    this.project = undefined
    this.category = undefined

    this.serviceAuthCreds = undefined
    this.userAuthCreds = undefined
  }

  /**
   * Set new service access token
   * @param {string} accessToken 
   */
  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  /**
   * Set project to use for invocations
   * @param {number} projectId 
   */
  setProject(projectId) {
    this.project = projectId
  }

  /**
   * Set category to use for invocations
   * @param {string} categoryId 
   */
  setCategory(categoryId) {
    this.category = categoryId
  }

  /**
   * Set credentials to use for extension calls
   * @param {string} clientId 
   * @param {string} clientSecret 
   */
  setServiceAuthCreds(clientId, clientSecret) {
    this.serviceAuthCreds = { clientId, clientSecret }
  }

  /**
   * Set credentials to use for authorizing users
   * @param {string} clientId 
   * @param {string} clientSecret 
   */
  setUserAuthCreds(clientId, clientSecret) {
    this.userAuthCreds = { clientId, clientSecret }
  }

  getData() {
    return {
      category: this.category,
      project: this.project,
      accessToken: this.accessToken,
      serviceAuthCreds: this.serviceAuthCreds,
      userAuthCreds: this.userAuthCreds,
    }
  }

  hasRequiredData() {
    return typeof this.project === "number" && !!this.category && !!this.serviceAuthCreds && !!this.userAuthCreds
  }

  getActionLog() {
    return this.actionLog.slice(0).reverse()
  }

  /**
   * Append action to admin log
   * @param {string} name 
   * @param {string} action 
   */
  appendActionLog(name, action) {
    const prefix = `${name} - ${new Date().toLocaleDateString()}`
    const data = getActionData(action)
    console.info(prefix, data)

    this.actionLog.push({
      name,
      time: new Date(),
      data: JSON.stringify(action, null, 2)
    })
  }

}

/**
 * Get readable data form action
 * @param {*} action
 */
function getActionData(action) {
  if (typeof action === "object" && action.response && action.response.data) {
    return action.response.data
  } else if (action instanceof Error) {
    return action.message
  } else {
    return action
  }
}

module.exports = { applicationState: new ApplicationState() }