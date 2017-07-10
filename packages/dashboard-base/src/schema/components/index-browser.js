import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { PrimaryButton } from "office-ui-fabric-react/lib/Button"

import { selectedIndex, selectedDatabase } from "../"
import { faunaClient } from "../../authentication"
import { watchForError } from "../../notifications"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { InstancesList } from "../../dataset"
import { ReplEditor, evalQuery } from "../../repl"
import { KeyType } from "../../persistence/faunadb-wrapper"

export class IndexBrowser extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState(props)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onSelectRef = this.onSelectRef.bind(this)
  }

  initialState(props) {
    return {
      terms: '""',
      queryFn: this.buildQuery(props)
    }
  }

  componentDidMount() {
    this.setState(this.initialState(this.props))
  }

  componentWillReceiveProps(next) {
    if (!this.props.index.equals(next.index)) {
      this.setState(this.initialState(next))
    }
  }

  buildQuery({ client, index, path }, terms = null) {
    if (!index.get("ref")) return

    if (index.get("terms").size !== 0) {
      if (!terms) return

      return options =>
        evalQuery(parsedTerms =>
          client.query(path, KeyType.SERVER, q.Paginate(
            q.Match(index.get("ref"), parsedTerms),
            options
          ))
        )(terms)
    }

    return (options) =>
      client.query(path, KeyType.SERVER, q.Paginate(
        q.Match(index.get("ref")),
        options
      ))
  }

  onChange(terms) {
    this.setState({ terms })
  }

  onSubmit() {
    this.setState({
      queryFn: this.buildQuery(
        this.props,
        this.state.terms
      )
    })
  }

  onSelectRef(ref) {
    const { client, path } = this.props

    return this.props.dispatch(
      monitorActivity(
        watchForError("Can't fetch selected instance", () =>
          client.query(path, KeyType.SERVER, q.Get(ref))
        )
      )
    )
  }

  render() {
    const { index, isBusy } = this.props
    const { terms, queryFn } = this.state

    return <div>
      {index.get("terms").size !== 0 ?
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12">
            <h3>Lookup</h3>
            <ReplEditor
              mode={ReplEditor.Mode.TEXT_FIELD}
              name="index-lookup-editor"
              value={terms}
              onChange={this.onChange}
              shortcuts={[{
                name: "search",
                bindKey: { win: "Enter", mac: "Enter" },
                exec: this.onSubmit
              }]} />

            <p className="ms-TextField-description">
              The contents of this field will be evaluated with the context of a repl and placed in
              the "terms" field of the index look up query.
            </p>

            <PrimaryButton
              disabled={isBusy}
              onClick={this.onSubmit}>
              Search
            </PrimaryButton>
          </div>
        </div> : null}

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <InstancesList query={queryFn} onSelectRef={this.onSelectRef} />
        </div>
      </div>
    </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    index: selectedIndex(state),
    path: selectedDatabase(state).get("path"),
    isBusy: isBusy(state)
  })
)(IndexBrowser)
