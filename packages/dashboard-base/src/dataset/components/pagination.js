import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField } from "office-ui-fabric-react/lib/TextField"
import { CommandButton, IconButton } from "office-ui-fabric-react/lib/Button"

import "./pagination.css"
import { watchForError } from "../../notifications"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { QueryResult } from "../../dataset"

class Pagination extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.refresh = this.refresh.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onFinishTyping = this.onFinishTyping.bind(this)
  }

  initialState() {
    return {
      size: 16,
      cursor: {},
      result: null
    }
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    this.queryIndex(this.props.query)
  }

  componentWillReceiveProps(next) {
    if (this.props.query !== next.query) {
      this.reset(() => this.queryIndex(next.query))
    }
  }

  reset(callback) {
    this.setState(this.initialState(), callback)
  }

  queryIndex(query) {
    if (!query) {
      this.reset()
      return
    }

    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Could not paginate through the dataset",
          () => query({
            ...this.state.cursor,
            size: this.state.size,
          })
        )
      )
    ).then(
      result => this.setState({ result })
    )
  }

  onChange(size) {
    const n = parseInt(size, 10)
    if (!isNaN(n)) this.setState({ size: n })
  }

  onFinishTyping(size) {
    if (!isNaN(size) && size > 0) {
      this.setState({ cursor: {} }, this.refresh)
    }

    return ""
  }

  setCursor(name, value) {
    return () => {
      this.setState({
        cursor: {
          [name]: value
        }
      }, () => this.refresh())
    }
  }

  render() {
    const { isBusy, onSelectRef } = this.props
    const { result } = this.state
    if (!result) return null

    return <div className="ms-Grid pagination">
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm9">
          <CommandButton
            disabled={isBusy}
            onClick={this.refresh}
            iconProps={{ iconName: "Refresh" }}>
              Refresh
          </CommandButton>
        </div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-textAlignCenter">
          <IconButton
            disabled={!result.before || isBusy}
            onClick={this.setCursor("before", result.before)}
            iconProps={{ iconName: "ChevronLeft" }} />
        </div>
        <div className="ms-Grid-col ms-u-sm1">
          <TextField
            disabled={isBusy}
            value={this.state.size}
            onChanged={this.onChange}
            onGetErrorMessage={this.onFinishTyping} />
        </div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-textAlignCenter">
          <IconButton
            disabled={!result.after || isBusy}
            onClick={this.setCursor("after", result.after)}
            iconProps={{ iconName: "ChevronRight" }} />
        </div>
      </div>

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <QueryResult result={result} onSelectRef={onSelectRef} />
        </div>
      </div>
    </div>
  }
}

export default connect(
  state => ({
    isBusy: isBusy(state)
  })
)(Pagination)
