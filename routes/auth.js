const express = require('express');
const router = express.Router();
const { fetchUserTokens } = require("../services/auth")
const { applicationState } = require("../services/state")

/**
 * Handle authorization redirect
 * Use provided code to fetch access & id token for user
 */
router.get('/', async function (req, res) {
  try {
    const { code, iss, client_id } = req.query
    applicationState.appendActionLog(req.url, { code, iss, client_id })

    const { accessToken, spencerUserId } = await fetchUserTokens(code)
    applicationState.appendActionLog(req.url, { accessToken, spencerUserId })

    req.session.accessToken = accessToken
    req.session.spencerUserId = spencerUserId

    res.redirect("/form")
  } catch (err) {
    applicationState.appendActionLog(req.url, err.response || err)
    res.status(500)
    res.send(err)
  }
});

module.exports = router;
