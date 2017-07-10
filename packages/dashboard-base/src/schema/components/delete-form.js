import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField } from "office-ui-fabric-react/lib/TextField"
import { DefaultButton } from "office-ui-fabric-react/lib/Button"

import "./delete-form.css"
import { faunaClient } from "../../authentication"
import { monitorActivity, isBusy } from "../../activity-monitor"

class DeleteForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.onChange = this.onChange.bind(this)
    this.remove = this.remove.bind(this)
  }

  initialState() {
    return {
      name: ""
    }
  }

  componentDidMount() {
    this.reset()
  }

  componentWillReceiveProps(next) {
    if (this.props.validateName !== next.validateName) {
      this.reset()
    }
  }

  reset() {
    this.setState(this.initialState())
  }

  onChange(name) {
    this.setState({ name })
  }

  remove(e) {
    e.preventDefault()
    return this.props.dispatch(monitorActivity(this.props.onDelete()))
  }

  render() {
    return <div className="delete-form">
      <h3>{this.props.title}</h3>
      <form onSubmit={this.remove}>
        <TextField
          required={true}
          label="Name"
          description={"Type the "+(this.props.type||"resource")+" name to confirm."}
          value={this.state.name}
          onBeforeChange={this.onChange} />

        <DefaultButton
          type="submit"
          disabled={(this.props.validateName !== this.state.name) || this.props.isBusy}>
          {this.props.buttonText}
        </DefaultButton>
      </form>
    </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    isBusy: isBusy(state)
  })
)(DeleteForm)
