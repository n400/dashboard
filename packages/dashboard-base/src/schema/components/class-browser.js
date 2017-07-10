import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { Link } from "react-router"
import { PrimaryButton } from "office-ui-fabric-react/lib/Button"

import { selectedClass, selectedDatabase, createIndex } from "../"
import { faunaClient } from "../../authentication"
import { isBusy, monitorActivity } from "../../activity-monitor"
import { watchForError } from "../../notifications"
import { linkForRef } from "../../router"
import { InstancesList } from "../../dataset"
import { KeyType } from "../../persistence/faunadb-wrapper"

export class ClassBrowser extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState(props)
    this.createClassIndex = this.createClassIndex.bind(this)
    this.onSelectRef = this.onSelectRef.bind(this)
  }

  initialState(props) {
    const index = this.findClassCoveringRef(props.clazz)

    return  {
      index,
      queryFn: this.buildQueryFn(props, index)
    }
  }

  findClassCoveringRef(clazz) {
    const res = clazz.get("indexes")
      .filter(idx =>
        idx.get("terms").isEmpty() && (
          idx.get("values").isEmpty() ||
          idx.get("values").some(v => v.getIn(["field", 0]) === "ref")
        )
      )
      .sort((a, b) => {
        if (a.get("values").isEmpty() && b.get("values").isEmpty())
          return a.get("name") < b.get("name") ? -1 : 1

        if (a.get("values").isEmpty()) return -1
        if (b.get("values").isEmpty()) return 1
        return 0
      })

    return res.isEmpty() ? null : res.get(0)
  }

  componentDidMount() {
    this.setState(this.initialState(this.props))
  }

  componentWillReceiveProps(next) {
    if (this.props.clazz !== next.clazz) {
      this.setState(this.initialState(next))
    }
  }

  buildQueryFn({ client, path }, index) {
    return opts =>
      client.query(path, KeyType.SERVER,
        q.Map(
          q.Paginate(q.Match(index.get("ref")), opts),
          res => this.getRef(res, index)
        )
      ).then(res => ({
        ...res,
        data: res.data.map(inst => ({
          ref: inst.ref,
          ...inst.data
        }))
      }))
  }

  getRef(res, index) {
    const values = index.get("values")
    if (values.size <= 1) return q.Get(res)

    return q.Get(q.Select(
      values
        .zip(values.keySeq())
        .find(v => v[0].getIn(["field", 0]) === "ref")[1],
      res
    ))
  }

  createClassIndex(e) {
    e.preventDefault()
    const { client, path, clazz } = this.props

    return this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while creating class index",
          createIndex(client, path, {
            name: this.findAvailableIndexName(clazz),
            source: clazz.get("ref")
          })
        )
      )
    )
  }

  findAvailableIndexName(clazz, attempt = 0) {
    const name = attempt === 0 ?
      `all_${clazz.get("name")}` :
      `all_${clazz.get("name")}_${attempt}`

    return clazz.get("indexes").some(idx => idx.get("name") === name) ?
      this.findAvailableIndexName(clazz, attempt + 1) :
      name
  }

  onSelectRef(ref) {
    const { client, path } = this.props

    return this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while fetching instance information", () =>
          client.query(path, KeyType.SERVER, q.Get(ref))
        )
      )
    )
  }

  render() {
    if (!this.state.index) {
      return this.renderNoClassIndexPage()
    }

    const { databaseUrl } = this.props
    const { index } = this.state
    const indexLink = linkForRef(databaseUrl, index.get("ref"))

    return <div>
      <InstancesList query={this.state.queryFn} onSelectRef={this.onSelectRef} />
      <p className="ms-TextField-description">
        This view was derived from <Link to={indexLink.get("url")}>{indexLink.get("name")}</Link>.
      </p>
    </div>
  }

  renderNoClassIndexPage() {
    const { isBusy } = this.props

    return <div>
      <p>No eligible class index found.</p>
      <p className="ms-TextField-description">
        Without a class index instances can only be loaded by
        Ref. A class index indexes all members of the class under a single key. For large
        datasets this can increase storage and processing overhead, so use class
        indexes sparingly in production.
      </p>
      <PrimaryButton
        disabled={isBusy}
        onClick={this.createClassIndex}>
          Create a class index now
      </PrimaryButton>
    </div>
  }

}

export default connect(
  state => ({
    path: selectedDatabase(state).get("path"),
    databaseUrl: selectedDatabase(state).get("url"),
    clazz: selectedClass(state),
    client: faunaClient(state),
    isBusy: isBusy(state)
  })
)(ClassBrowser)
