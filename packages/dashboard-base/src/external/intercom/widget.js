import { Component } from "react"
import { connect } from "react-redux"

import { loadIntercomWidget, unloadIntercomWidget } from "./sdk"
import { intercomSettings } from "../../authentication"

class IntercomWidget extends Component {
  componentDidMount() {
    this.updateWidget(this.props.settings)
  }

  componentWillReceiveProps(next) {
    if (this.props.settings !== next.settings) {
      this.updateWidget(next.settings)
    }
  }

  updateWidget(settings) {
    if (settings) {
      loadIntercomWidget(settings.toJS())
    } else {
      unloadIntercomWidget()
    }
  }

  componentWillUnmount() { unloadIntercomWidget() }
  shouldComponentUpdate() { return false }
  render() { return false }
}

export default connect(
  state => ({
    settings: intercomSettings(state)
  })
)(IntercomWidget)
