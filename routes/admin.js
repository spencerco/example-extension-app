const express = require('express');
const router = express.Router();
const { getHostUrl } = require("../utils")
const { applicationState } = require("../services/state")
const { invokeTrigger } = require("../services/spencer")
const { REQUEST_TRIGGER_SLUG, API_BASE_URL, IDENTITY_BASE_URL } = require("../constants")

router.get('/', function (req, res, next) {
  res.render("admin", {
    title: 'Admin',
    data: applicationState.getData(),
    primaryAction: getHostUrl(req, "/form"),
    hasRequiredData: applicationState.hasRequiredData(),
    actionLog: applicationState.getActionLog(),
    apiUrl: API_BASE_URL,
    identityUrl: IDENTITY_BASE_URL
  })
});

router.post('/', function (req, res, next) {
  const { project, category, serviceClientId, serviceClientSecret, userClientId, userClientSecret } = req.body
  if (!project || !category || !serviceClientId || !serviceClientSecret || !userClientId || !userClientSecret) {
    res.status(400)
    res.send("Wrong body")
    return;
  }
  applicationState.setProject(project)
  applicationState.setCategory(category)
  applicationState.setServiceAuthCreds(serviceClientId, serviceClientSecret)
  applicationState.setUserAuthCreds(userClientId, userClientSecret)
  applicationState.persist()

  res.redirect("/admin")
});

/**
 * Trigger invocation endpoint
 */
router.post('/triggers', async function (req, res, next) {
  const { primaryAction, secondaryAction, notification = "off" } = req.body
  if (!primaryAction) {
    applicationState.appendActionLog(req.url, { msg: "Failed to invoke trigger, no primaryAction or secondaryAction provided" })
  }

  try {
    const response = await invokeTrigger({
      triggerId: REQUEST_TRIGGER_SLUG,
      primaryAction,
      secondaryAction,
      notification: notification === "on"
    })
    applicationState.appendActionLog(req.url, response)
  } catch (err) {
    applicationState.appendActionLog(req.url, err)
  }
  res.redirect("/admin")
});

module.exports = router;
