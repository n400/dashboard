import React from "react"
import { connect } from "react-redux"
import { PrimaryButton } from "office-ui-fabric-react/lib/Button"

import { selectedDatabase } from "../"
import { monitorActivity, isBusy } from "../../activity-monitor"

const SchemaForm = (props) => {
  const onSubmit = (e) => {
    e.preventDefault()
    return props
      .dispatch(monitorActivity(props.onSubmit()))
      .then(props.onFinish)
  }

  return <form onSubmit={onSubmit}>
      <h3>{props.title}{props.context ? " in " + props.context : null}</h3>
      {props.children}
      <PrimaryButton type="submit" disabled={props.disabled}>
          {props.buttonText}
      </PrimaryButton>
    </form>
}

SchemaForm.displayName = "SchemaForm"

export default connect(
  state => ({
    disabled: isBusy(state),
    context: selectedDatabase(state).get("path").join("/")
  })
)(SchemaForm)
