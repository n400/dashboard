import React, { Component } from "react"
import { connect } from "react-redux"
import { parse as parseURL } from "url"
import { Spinner, SpinnerType } from "office-ui-fabric-react/lib/Spinner"
import { PrimaryButton } from "office-ui-fabric-react/lib/Button"
import { TextField } from "office-ui-fabric-react/lib/TextField"
import { Dialog, DialogType, DialogFooter } from "office-ui-fabric-react/lib/Dialog"

import { login, restoreUserSession } from "../"
import { Events } from "../../plugins"

const DEFAULT_ENDPOINT = "https://db.fauna.com/"

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.onSubmit = this.onSubmit.bind(this)
  }

  initialState() {
    return {
      endpoint: "",
      secret: "",
      errors: {},
      message: "Loading..."
    }
  }

  componentDidMount() {
    Events.listen("@@authentication/user-logged-out", () => {
      this.setState({ message: "Logging out..." }, () => {
        window.location = "/"
      })
    })

    this
      .withMessage("Restoring user session...", restoreUserSession())
      .then(user => !user ? this.setState({ message: null }) : null)
  }

  withMessage(message, action) {
    this.setState({ message })
    return this.watchForError(action)
  }

  watchForError(action) {
    return this.props.dispatch(action).catch(error => {
      this.setState({
        errors: {
          secret: this.formatError(error)
        },
        message: null
      })

      throw error
    })
  }

  formatError(error) {
    if (error.name === "Unauthorized") return "Unauthorized: Please, verify your key's secret and try again."
    if (error.message) return error.message
    return `Unexpected error: ${error}`
  }

  onChange(key) {
    return value => {
      this.setState({
        [key]: value,
        errors: {
          ...this.state.errors,
          [key]: null
        }
      })
    }
  }

  onSubmit(e) {
    e.preventDefault()
    if (this.validate()) {
      const { endpoint, secret } = this.state
      this.withMessage("Logging in...", login(endpoint, secret))
    }
  }

  validate() {
    const errors = {
      endpoint: this.validateEndpoint(),
      secret: this.validateSecret()
    }

    if (errors.endpoint || errors.secret) {
      this.setState({ errors })
      return false
    }

    return true
  }

  validateEndpoint() {
    if (this.state.endpoint) {
      const { hostname, protocol } = parseURL(this.state.endpoint)
      if (!hostname || !protocol) return "Invalid URL."
    }
  }

  validateSecret() {
    if (!this.state.secret.trim()) {
      return "Please, inform the key's secret for your FaunaDB key."
    }
  }

  render() {
    const { endpoint, secret, message, errors } = this.state

    return (
      <Dialog
        hidden={this.props.currentUser}
        dialogContentProps={{ type: DialogType.largeHeader }}
        modalProps={{ isBlocking: true }}
        title="Connect to FaunaDB"
      >
        {message != null ?
          <Spinner type={SpinnerType.large} label={message} /> :
          <form onSubmit={this.onSubmit}>
            <p className="ms-Dialog-subText">
              Visit <a href="https://fauna.com/dashboard">https://fauna.com/dashboard</a> or talk to your administrator to provision keys.
            </p>

            <TextField
              label="FaunaDB Endpoint URL"
              description="Leave this empty for Fauna Cloud."
              placeholder={DEFAULT_ENDPOINT}
              value={endpoint}
              onBeforeChange={this.onChange("endpoint")}
              errorMessage={errors.endpoint} />

            <TextField
              required={true}
              type="password"
              label="Key Secret"
              description="The secret associated with your FaunaDB key."
              value={secret}
              onBeforeChange={this.onChange("secret")}
              errorMessage={errors.secret} />

            <DialogFooter>
              <PrimaryButton type="submit">
                Use Secret
              </PrimaryButton>
            </DialogFooter>
          </form>}
      </Dialog>
    )
  }
}

// Dialog component is not consired pure by react-redux
// https://github.com/reactjs/react-redux/blob/master/docs/troubleshooting.md#my-views-arent-updating-when-something-changes-outside-of-redux
export default connect(
  state => ({
    currentUser: state.get("currentUser")
  }),
  null, null, { pure: false }
)(LoginForm)
