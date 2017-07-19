import { Component } from "react"
import { Events } from "dashboard-base"

import { loadIntercomWidget, unloadIntercomWidget } from "./sdk"

export default class IntercomWidget extends Component {
  componentDidMount() {
    Events.listen("@@authentication/user-logged-in", (user) => this.updateWidget(user))
    Events.listen("@@authentication/user-logged-out", () => this.updateWidget(null))
  }

  updateWidget(user) {
    const settings = this.intercomSettings(user)
    settings ? loadIntercomWidget(settings) : unloadIntercomWidget()
  }

  intercomSettings(user) {
    if (user && user.settings && user.settings.intercom) {
      return {
        email: user.email,
        user_id: user.userId,
        app_id: user.settings.intercom.appId,
        user_hash: user.settings.intercom.userHash
      }
    }

    return null
  }

  componentWillUnmount() { unloadIntercomWidget() }
  shouldComponentUpdate() { return false }
  render() { return false }
}
