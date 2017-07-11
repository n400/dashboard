import { Component } from "react"

const outletsByName = {}
const pluginByOutlet = {}

export class Outlet extends Component {
  constructor(props) {
    super(props)
    if (!props.name) throw new Error("Outlet must have a name")
  }

  componentWillMount() {
    outletsByName[this.props.name] = this
  }

  componentWillUnmount() {
    delete outletsByName[this.props.name]
  }

  render() {
    const plugin = pluginByOutlet[this.props.name]
    return plugin ? plugin.content() : this.props.children || null
  }
}

export class Plugin extends Component {
  constructor(props) {
    super(props)
    if (!props.outlet) throw new Error("Plugin must have an outlet")
  }

  componentWillMount() {
    pluginByOutlet[this.props.outlet] = this
  }

  componentWillUnmount() {
    delete pluginByOutlet[this.props.outlet]
  }

  content() {
    return this.props.children
  }

  render() {
    const outlet = outletsByName[this.props.outlet]
    if (outlet) outlet.forceUpdate()
    return null
  }
}
