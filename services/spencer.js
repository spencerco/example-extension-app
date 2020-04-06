const { clientAxios, serviceAxios } = require("./axios")
const { SUPPORTED_LANGUAGES } = require("../constants")
const { toDateTime } = require("../utils")
const { applicationState } = require("./state")

/**
 * Calls made with service token
 */

/**
 * Invoke trigger on extensions api with service access token
 * @param {{ triggerId: string, primaryAction: string, secondaryAction: string, variables: Object.<string, string> }} params
 */
async function invokeTrigger({ triggerId, primaryAction, secondaryAction, variables, notification }) {
  if (!applicationState.hasRequiredData()) {
    throw new Error("Application state does not have all required data")
  }
  // 30 min in the future
  const ttl = toDateTime(new Date(Date.now() + 30 * 60 * 1000))
  const { project, category } = applicationState.getData()
  const body = {
    ttl,
    notification,
    "project": {
      "id": project,
      "categories": [category],
    },
    "translations": SUPPORTED_LANGUAGES.map(locale => ({
      locale,
      "primary_action": primaryAction,
      "secondary_action": secondaryAction,
      variables
    }))
  }
  const { data } = await serviceAxios.post(`/extensions/api/triggers/${triggerId}/invocations`, body)
  return data
}

/**
 * Calls made with client token
 */

/**
 * Fetch Spencer user with its own token
 * @param {string} userId 
 * @param {string} accessToken 
 */
async function fetchSpencerUser(userId, accessToken) {
  const { data } = await clientAxios.get(`/api/users/${userId}`, {
    headers: {
      "authorization": `Bearer ${accessToken}`,
    }
  })
  return data
}

/**
 * Fetch user my-day categories from Spencer with own token
 * @param {string} userId 
 * @param {string} accessToken 
 */
async function fetchMyDayCategories(userId, accessToken) {
  const config = {
    headers: {
      "authorization": `Bearer ${accessToken}`,
    }
  }
  const { data } = await clientAxios.get(`/api/bespoke/delhaize/my-day/users/${userId}/categories`, config)
  const responses = await Promise.all(data.data.map(x => clientAxios.get(x.href, config)))
  return responses.map(res => res.data)
}

module.exports = { invokeTrigger, fetchSpencerUser, fetchMyDayCategories }