import React from "react"
import ReactDOM from "react-dom"
import ReactGA from "react-ga"
import Raven from "raven-js"
import { Dashboard, Plugin } from "dashboard-base"

import { IntercomWidget } from "./intercom"

const isProduction = process.env.NODE_ENV === "production"

if (isProduction) {
  Raven.config("https://a6a14ab8e3ab4cbb87edaa320ad57ecb@sentry.io/154810").install()
  require("./ga-events")
}

class CloudDashboard extends React.Component {
  componentDidMount() {
    if (isProduction) {
      ReactGA.initialize("UA-51914115-2")
    }
  }

  render() {
    return <Dashboard>
        <Plugin name="intercom" outlet="@@dashboard/after-application-content">
          <IntercomWidget />
        </Plugin>
      </Dashboard>
  }
}

ReactDOM.render(<CloudDashboard />, document.getElementById("root"))
