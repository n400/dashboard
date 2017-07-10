import Immutable, { Map } from "immutable"
import request from "superagent"
import Cookies from "js-cookie"
import { parse as parseURL } from "url"

import FaunaClient from "../persistence/faunadb-wrapper"
import SessionStorage from "../persistence/session-storage"

const WEBSITE = (() => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000"
  }

  const url = parseURL(window.location.href)
  const host = url.hostname.replace(/^\w+\./, "") // removes its subdomain
  return `${url.protocol}//${host}`
})()

const LOGGED_IN_USER = "loggedInUser"
const CLOUD_COOKIE = "dashboard"
const AUTH_API_TIMEOUT = 5000
const AUTH_API = `${WEBSITE}/dashboard/user_info`

const Actions = {
  LOGIN: "@@authentication/LOGIN",
  LOGOUT: "@@authentication/LOGOUT"
}

export const login = (endpoint, secret, settings = Map()) => dispatch => {
  return FaunaClient.discoverKeyType(endpoint, secret).then(client => {
    SessionStorage.set(LOGGED_IN_USER, {
      endpoint,
      secret
    })

    const user = Map({ endpoint, secret, settings, client })
    dispatch({ type: Actions.LOGIN, user })
    return user
  })
}

export const restoreUserSession = () => (dispatch) => {
  const savedUser = SessionStorage.get(LOGGED_IN_USER)
  if (savedUser) return dispatch(login(savedUser.endpoint, savedUser.secret))
  return Promise.resolve(null)
}

export const loginWithCloud = () => (dispatch) => {
  if (!Cookies.get(CLOUD_COOKIE))
    return Promise.resolve(false)

  return new Promise((resolve, reject) => {
    request.get(AUTH_API)
      .timeout(AUTH_API_TIMEOUT)
      .withCredentials()
      .end((error, res) => {
        if (error || !res.ok || !res.body) {
          reject("Cloud authentication request has failed.")
          return
        }

        const websiteUser = Immutable.fromJS(res.body)
        const user = dispatch(login(
          websiteUser.get("endpoint"),
          websiteUser.get("secret"),
          Map.of(
            "logoutUrl", `${WEBSITE}/logout`,
            "paymentUrl", `${WEBSITE}/account/billing`,
            "paymentSet", websiteUser.getIn(["flags", "paymentSet"], false),
            "acceptedTos", websiteUser.getIn(["flags", "acceptedTos"], false),
            "intercom", Map.of(
              "app_id", websiteUser.getIn(["settings", "intercom", "appId"]),
              "user_hash", websiteUser.getIn(["settings", "intercom", "userHash"]),
              "user_id", websiteUser.get("userId"),
              "email", websiteUser.get("email")
            )
          )
        ))

        resolve(user)
      })
  })
}

export const logout = () => (dispatch, getState) => {
  const logoutUrl = getState().getIn(["currentUser", "settings", "logoutUrl"], "/")

  Cookies.remove(CLOUD_COOKIE)
  SessionStorage.clear()
  dispatch({ type: Actions.LOGOUT })

  return logoutUrl
}

export const reduceUserSession = (state = null, action) => {
  switch (action.type) {
    case Actions.LOGIN:  return action.user
    case Actions.LOGOUT: return null
    default:             return state
  }
}
