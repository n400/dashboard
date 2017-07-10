import React, { Component } from "react"
import { CommandButton } from "office-ui-fabric-react/lib/Button"

import Pagination from "./pagination"
import InstanceInfo from "./instance-info"

export default class InstancesList extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState(props)
    this.onSelectRef = this.onSelectRef.bind(this)
    this.hideInstanceInfo = this.hideInstanceInfo.bind(this)
  }

  initialState(props) {
    return {
      queryFn: props.query,
      selectedInstance: null
    }
  }

  componentDidMount() {
    this.setState(this.initialState(this.props))
  }

  componentWillReceiveProps(next) {
    if (this.props.query !== next.query) {
      this.setState(this.initialState(next))
    }
  }

  onSelectRef(ref) {
    const promise = this.props.onSelectRef(ref)
    if (!promise) return null

    return promise.then(
      selectedInstance => this.setState({ selectedInstance })
    )
  }

  hideInstanceInfo() {
    this.setState({ selectedInstance: null })
  }

  render() {
    const { queryFn, selectedInstance } = this.state

    return <div>
      <div style={{display: selectedInstance ? "none" : "block"}}>
        <Pagination
          query={queryFn}
          onSelectRef={this.props.onSelectRef ? this.onSelectRef : null} />
      </div>

      <div style={{display: !selectedInstance ? "none" : "block"}}>
        <CommandButton
          iconProps={{ iconName: "ChromeBack" }}
          onClick={this.hideInstanceInfo}>
            Go back to the instances list
        </CommandButton>

        <InstanceInfo instance={selectedInstance} />
      </div>
    </div>
  }
}
