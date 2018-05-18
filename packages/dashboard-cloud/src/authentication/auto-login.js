import React, { Component } from "react"
import { parse as parseURL } from "url"
import { Dialog, DialogType } from "office-ui-fabric-react/lib/Dialog"
import { Spinner, SpinnerType } from "office-ui-fabric-react/lib/Spinner"
import { Events, Auth, Notifications } from "dashboard-base"

import { identifyCloudUser, logoutCloudUser } from "./cloud-login"

const WEBSITE = (() => {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000"
  const url = parseURL(window.location.href)
  const host = url.hostname.replace(/^\w+\./, "") // removes its subdomain
  return `${url.protocol}//${host}`
})()

export default class AutoCloudLogin extends Component {
  constructor(props) {
    super(props)
    this.state = { message: "Logging in..." }
  }

  componentDidMount() {
    Events.listen("@@authentication/user-logged-out", () => {
      this.setState({ message: "Logging out..." }, () => {
        logoutCloudUser()
        window.location = `${WEBSITE}/logout`
      })
    })

    identifyCloudUser(WEBSITE)
      .then(user => user ? this.loginWithUser(user) : window.location = `${WEBSITE}/dashboard`)
      .catch(this.notifyError)
  }

  loginWithUser(user) {
    Auth
      .login(user.endpoint, user.secret, user)
      .then(() => {
        this.setState({ message: null })
      })
  }

  notifyError(err) {
    Notifications.push(Notifications.Type.ERROR, `${err.message}. You'll be redirected to ${WEBSITE} in 5 seconds...`)
    setTimeout(() => window.location = WEBSITE, 5000)
  }

  render() {
    return <Dialog
        hidden={!this.state.message}
        dialogContentProps={{ type: DialogType.largeHeader }}
        modalProps={{ isBlocking: true }}
        title="Connect to FaunaDB">
        <Spinner type={SpinnerType.large} label={this.state.message} />
      </Dialog>
  }
}
