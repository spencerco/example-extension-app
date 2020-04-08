const moment = require("moment")
const url = require("url")

/**
 * Convert Date object to Spencer UTC date time string
 * @param {Date} date 
 */
function toDateTime(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Get the host url of the server
 * @param {object} req express request
 * @param {string} pathname appended path
 */
function getHostUrl(req, pathname) {
  return url.format({
    protocol: "https",
    host: req.get("host"),
    pathname
  })
}

module.exports = { toDateTime, getHostUrl }