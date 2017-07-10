import React from "react"
import ReactDOM from "react-dom"
import Raven from "raven-js"

import Dashboard from "./dashboard"

// FIXME: sentry should be at a plugin and enabled for could only
if (process.env.NODE_ENV === "production") {
  Raven
    .config("https://a6a14ab8e3ab4cbb87edaa320ad57ecb@sentry.io/154810")
    .install()
}

ReactDOM.render(
  <Dashboard />,
  document.getElementById("root")
)
