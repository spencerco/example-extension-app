const express = require('express');
const router = express.Router();
const { IDENTITY_BASE_URL, RESULT_TRIGGER_SLUG } = require("../constants")
const { getHostUrl } = require("../utils")
const qs = require("querystring")
const { applicationState } = require("../services/state")
const { fetchSpencerUser, fetchMyDayCategories, invokeTrigger } = require("../services/spencer")

/**
 * Render form if user is authenticated
 * Redirect to identity authorization url if not.
 */
router.get('/', async function (req, res, next) {
  try {
    if (!applicationState.hasRequiredData()) {
      res.render("incompleteData")
      return;
    }

    // Client provides uri to redirect to when the flow is done (go back to app)
    const { redirect_uri } = req.query
    // Only overwrite when provided, after redirect from authorize it won't contain the redirect_uri anymore
    if (redirect_uri) {
      req.session.redirectUri = redirect_uri
    }

    const { accessToken, spencerUserId } = req.session
    if (accessToken && spencerUserId) {
      // User session is authenticated
      const [spencerUser, myDayCategories] = await Promise.all([
        fetchSpencerUser(spencerUserId, accessToken),
        fetchMyDayCategories(spencerUserId, accessToken)
      ])
      applicationState.appendActionLog(req.url, spencerUser)
      res.render("form", {
        title: 'Form Submitted',
        spencerUser,
        myDayCategories,
      })
    } else {
      const { clientId } = applicationState.getData().userAuthCreds
      // Authorize user
      const data = qs.stringify({
        "client_id": clientId,
        "response_type": "code",
        "redirect_uri": getHostUrl(req, "/authorize")
      })
      res.redirect(`${IDENTITY_BASE_URL}/authorize?${data}`)
    }
  } catch (err) {
    applicationState.appendActionLog(req.url, err.response || err)
    res.status(500)
    res.send(err)
  }
});

/**
 * Handle form submission and invoke new card
 */
router.post('/submit', async function (req, res, next) {
  try {
    const { category } = req.body
    const { accessToken, spencerUserId, redirectUri = "https://spencer.co" } = req.session
    if (!category || !accessToken || !spencerUserId) {
      res.status(400)
      res.send()
      return;
    }
    applicationState.appendActionLog(req.url, req.body)
    const spencerUser = await fetchSpencerUser(spencerUserId, accessToken)
    const response = await invokeTrigger({
      triggerId: RESULT_TRIGGER_SLUG,
      primaryAction: "https://delhaize-stag-backoffice.spencer.co/backoffice/publications",
      variables: {
        teamName: spencerUser.departement || spencerUser.division || spencerUser.title || "Cecemel",
        date: (new Date()).toLocaleDateString()
      },
      notification: true
    })
    applicationState.appendActionLog(req.url, response)
    res.render("formSubmitted", { title: 'Form Submitted', redirectUri })
  } catch (err) {
    applicationState.appendActionLog(req.url, err.response || err)
    res.status(500)
    res.send(err)
  }
});

module.exports = router;
