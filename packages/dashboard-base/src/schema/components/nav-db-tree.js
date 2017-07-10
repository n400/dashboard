import React, { Component } from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import CustomNav from "./custom-nav"
import { databaseTree, loadDatabases } from "../"
import { selectedResource } from "../../router"
import { faunaClient } from "../../authentication"
import { watchForError } from "../../notifications"
import { monitorActivity } from "../../activity-monitor"

class NavDBTree extends Component {

  constructor(props) {
    super(props)
    this.state = { links: [] }
  }

  componentDidMount() {
    this.buildLinks(this.props.databaseTree)
  }

  componentWillReceiveProps(next) {
    if (this.props.databaseTree !== next.databaseTree) {
      this.buildLinks(next.databaseTree)
    }
  }

  buildLinks(databaseTree) {
    this.setState({
      links: [
        this.buildDatabaseTreeLinks(databaseTree, this.state.links)
      ]
    })
  }

  buildDatabaseTreeLinks(db, links) {
    const key = db.get("url")
    const link = links.find(l => l.key === key) || {}

    const isAtSelectedPath = db.get("path").every((seg, index) =>
      this.props.selectedDatabasePath.get(index) === seg)

    const res = {
      key: key,
      url: key,
      name: db.get("name"),
      path: db.get("path"),
      links: db.get("databases").map(sub => this.buildDatabaseTreeLinks(sub, link.links || [])).toJS(),
      isExpanded: !!link.isExpanded ? link.isExpanded : isAtSelectedPath
    }

    if (db.get("hasMore"))  {
      res.links.push({
        key: `${db.get("url")}-load-more`,
        name: "Load more",
        icon: "CirclePlus",
        onClick: this.loadMoreDatabases.bind(this, db.get("path"), db.get("cursor"))
      })
    }

    return res
  }

  loadMoreDatabases(dbPath, cursor) {
    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while fetching databases",
          loadDatabases(this.props.client, dbPath, cursor)
        )
      )
    )
  }

  onClick(e, link) {
    e.preventDefault()
    browserHistory.push(link.url)
  }

  onExpand(link) {
    if (link.isExpanded) return

    return this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while fetching schema information",
          loadDatabases(this.props.client, link.path)
        )
      )
    )
  }

  render() {
    const links = [{
      name: "Databases",
      links: this.state.links
    }]

    return <CustomNav
      groups={links}
      selectedKey={this.props.selectedDatabaseUrl}
      onExpand={this.onExpand.bind(this)}
      onLinkClick={this.onClick.bind(this)} />
  }
}

export default connect(
  state => ({
    databaseTree: databaseTree(state),
    selectedDatabaseUrl: selectedResource(state).getIn(["database", "url"]),
    selectedDatabasePath: selectedResource(state).getIn(["database", "path"]),
    client: faunaClient(state)
  })
)(NavDBTree)
