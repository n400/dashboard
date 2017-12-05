import { Map } from "immutable"

import FaunaClient from "../persistence/faunadb-wrapper"
import SessionStorage from "../persistence/session-storage"
import { Events } from "../plugins"

const LOGGED_IN_USER = "loggedInUser"

const Actions = {
  LOGIN: "@@authentication/LOGIN",
  LOGOUT: "@@authentication/LOGOUT"
}

export const login = (endpoint, secret, userInfo = {}) => dispatch => {
  return FaunaClient.discoverKeyType(endpoint, secret).then(client => {
    SessionStorage.set(LOGGED_IN_USER, {
      endpoint,
      secret
    })

    const user = Map({
      endpoint,
      secret,
      client
    })

    dispatch({ type: Actions.LOGIN, user })
    Events.fire("@@authentication/user-logged-in", {
      email : userInfo.email,
      userId : userInfo.userId,
      settings : userInfo.settings,
      flags : userInfo.flags
    })
    return user
  })
}

export const restoreUserSession = () => (dispatch) => {
  const savedUser = SessionStorage.get(LOGGED_IN_USER)
  return savedUser ?
    dispatch(login(savedUser.endpoint, savedUser.secret)) :
    Promise.resolve(null)
}

export const logout = () => (dispatch) => {
  SessionStorage.clear()
  dispatch({ type: Actions.LOGOUT })
  Events.fire("@@authentication/user-logged-out")
}

export const reduceUserSession = (state = null, action) => {
  switch (action.type) {
    case Actions.LOGIN:  return action.user
    case Actions.LOGOUT: return null
    default:             return state
  }
}
