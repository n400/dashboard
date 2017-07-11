export { default as Dashboard } from "./src/dashboard"
export * from "./src/plugins"

import store from "./src/store"
import { login } from "./src/authentication"
import { pushNotification, NotificationType } from "./src/notifications"

export const Auth = {
  login: function(endpoint, secret, userInfo) {
    return store.dispatch(login(endpoint, secret, userInfo))
  }
}

export const Notifications = {
  Type: NotificationType,
  push: function(type, message) {
    return store.dispatch(pushNotification(type, message))
  }
}
