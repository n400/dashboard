import React from "react"
import ReactDOM from "react-dom"
import ReactGA from "react-ga"
import { Dashboard } from "dashboard-base"

require("./ga-events")

class CloudDashboard extends React.Component {
  componentDidMount() {
    if (process.env.NODE_ENV === "production") {
      ReactGA.initialize("UA-51914115-2")
    }
  }

  render() {
    return <Dashboard />
  }
}

ReactDOM.render(<CloudDashboard />, document.getElementById("root"))
