const API_BASE_URL = "https://delhaize-stag-api.spencer.co/"

const REQUEST_TRIGGER_SLUG = "request-trigger"
const RESULT_TRIGGER_SLUG = "result-trigger"

const IDENTITY_BASE_URL = "https://spencermultisso-staging-identity.spencer.co/auth/oauth2/realms/root/realms/aholddelhaize"

const SUPPORTED_LANGUAGES = ["en-US", "nl-BE", "fr-BE"]

const SPENCER_OS_HEADER = "extension"
const LANGUAGE_HEADER = "en-US"

module.exports = {
  API_BASE_URL,
  IDENTITY_BASE_URL,
  REQUEST_TRIGGER_SLUG,
  RESULT_TRIGGER_SLUG,
  SUPPORTED_LANGUAGES,
  SPENCER_OS_HEADER,
  LANGUAGE_HEADER
}