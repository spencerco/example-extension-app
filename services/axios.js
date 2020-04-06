
const { API_BASE_URL, SPENCER_OS_HEADER, LANGUAGE_HEADER } = require("../constants");
const { applicationState } = require("./state")
const { fetchServiceAccessToken } = require("./auth")

const axios = require('axios').default;

// Axios instance for Spencer calls made as a user
const clientAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-spencer-os": SPENCER_OS_HEADER,
    "accept-language": LANGUAGE_HEADER
  }
});

// Axios instance for Spencer calls made as extension
const serviceAxios = axios.create({
  baseURL: API_BASE_URL
});

// Fetch access token if none are available.
serviceAxios.interceptors.request.use(
  async (request) => {
    if (request.baseURL !== API_BASE_URL) return request;
    if (request.headers["authorization"]) return request;

    let { accessToken } = applicationState.getData()
    if (!accessToken) {
      accessToken = await fetchServiceAccessToken()
      applicationState.appendActionLog("Service Axios", {
        msg: "Fetched accessToken",
        accessToken
      })
      applicationState.setAccessToken(accessToken)
    }
    if (accessToken) {
      request.headers["authorization"] = `Bearer ${accessToken}`
    }
    return request
  }
);

// Fetch access token if api returned 401
serviceAxios.interceptors.response.use(response => response, async function (error) {
  if (error.response && 401 === error.response.status) {
    const accessToken = await fetchServiceAccessToken()
    applicationState.setAccessToken(accessToken)
    return await serviceAxios.request(error.config)
  } else {
    throw error
  }
});

module.exports = { serviceAxios, clientAxios }