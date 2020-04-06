const { IDENTITY_BASE_URL, AUTHORIZATION_CODE_CREDENTIALS, REDIRECT_URI } = require("../constants")
const qs = require("querystring")
const jwt = require("jsonwebtoken")
const axios = require('axios').default;
const { applicationState } = require("./state")

// Axios instance for auth calls made as a service
const authAxios = axios.create({
  baseURL: IDENTITY_BASE_URL
});


/**
 * Fetch access token as extension with own credentials
 */
async function fetchServiceAccessToken() {
  const { clientSecret, clientId } = applicationState.getData().serviceAuthCreds
  const data = qs.stringify({
    'client_secret': clientSecret,
    'client_id': clientId,
    'grant_type': 'client_credentials'
  });

  const response = await authAxios.request({
    method: "POST",
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: "/access_token",
    data
  })
  return response.data.access_token
}

/**
 * Fetch access token as user with authorization code
 * @param {string} code
 */
async function fetchUserTokens(code) {
  const { clientSecret, clientId } = applicationState.getData().userAuthCreds
  const body = qs.stringify({
    code,
    'grant_type': 'authorization_code',
    'redirect_uri': REDIRECT_URI
  });
  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const { data } = await authAxios.request({
    method: "POST",
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'authorization': `Basic ${base64}`
    },
    url: "/access_token",
    data: body
  })
  const spencerUserId = jwt.decode(data.id_token).sub;
  return {
    accessToken: data.access_token,
    spencerUserId,
  }
}

module.exports = { fetchServiceAccessToken, fetchUserTokens }