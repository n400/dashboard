import Cookies from "js-cookie"

const CLOUD_COOKIE = "fauna_dashboard"
const AUTH_API_TIMEOUT = 60000

const parseResponse = (res) => {
  if (!res.ok) {
    throw new Error(
      "Unexpected error while logging into FaunaDB Cloud. " +
      "Try again or check our status page: https://app.fauna.com/status")
  }

  return res.json()
}

export const logoutCloudUser = () => Cookies.remove(CLOUD_COOKIE)

export const identifyCloudUser = (websiteUrl) => {
  return !Cookies.get(CLOUD_COOKIE) ?
    Promise.resolve(false) :
    Promise.race([
      new Promise((resolve, reject) => setTimeout(reject, AUTH_API_TIMEOUT, "Request timeout")),
      fetch(`${websiteUrl}/dashboard/user_info`, { credentials: "include" }).then(parseResponse)
    ])
}
