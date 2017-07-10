import React, { Component } from "react"

const outletsByName = {}
const pluginsByOutlet = {}

export class Outlet extends Component {
  constructor(props) {
    super(props)
    if (!props.name) throw new Error("Outlet must have a name")
    outletsByName[props.name] = this
  }

  render() {
    const plugins = Object.values(pluginsByOutlet[this.props.name] || {})
    return plugins.length > 0 ? <div>{plugins.map(p => p.contents())}</div> : null
  }
}

export class Plugin extends Component {
  constructor(props) {
    super(props)
    if (!props.name || !props.outlet) throw new Error("Plugin must have name and outlet")
    pluginsByOutlet[props.outlet] = Object.assign(pluginsByOutlet[props.outlet] || {}, {
      [props.name]: this
    })
  }

  contents() {
    return this.props.children
  }

  render() {
    const outlet = outletsByName[this.props.outlet]
    if (outlet) outlet.forceUpdate()
    return false
  }
}
