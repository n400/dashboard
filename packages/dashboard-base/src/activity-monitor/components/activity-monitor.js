import React from "react"
import { connect } from "react-redux"
import { Spinner } from "office-ui-fabric-react/lib/Spinner"

import "./activity-monitor.css"
import { isBusy } from "../"

export const ActivityMonitor = (props) => {
  if (!props.isBusy) return null
  return <Spinner className="activity-monitor" />
}

ActivityMonitor.displayName = "ActivityMonitor"

export default connect(
  state => ({
    isBusy: isBusy(state)
  })
)(ActivityMonitor)
