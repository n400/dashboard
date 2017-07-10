import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"

import SchemaForm from "./schema-form"
import { selectedDatabase, selectedClass } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"
import { KeyType } from "../../persistence/faunadb-wrapper"
import { ReplEditor, evalQuery } from "../../repl"
import { InstanceInfo } from "../../dataset"

export class ClassInstance extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  initialState() {
    return {
      data: "{}",
      instance: null
    }
  }

  componentDidMount() {
    this.setState(this.initialState())
  }

  componentWillReceiveProps(next) {
    if (this.props.clazz !== next.clazz) {
      this.setState(this.initialState())
    }
  }

  onChange(data) {
    this.setState({ data })
  }

  onSubmit() {
    const { client, path, clazz } = this.props
    const { data } = this.state

    return notify("Instance created successfully", () =>
      evalQuery(data =>
        client.query(
          path,
          KeyType.SERVER,
          q.Create(clazz.get("ref"), { data })
        )
      )(data).then(
        instance => this.setState({ instance })
      )
    )
  }

  render() {
    const { clazz } = this.props
    const { data, instance } = this.state

    return <div>
      <SchemaForm
        title={`Create an instance of ${clazz.get("name")}`}
        buttonText="Create Instance"
        onSubmit={this.onSubmit}>
          <ReplEditor
            mode={ReplEditor.Mode.TEXT_AREA}
            name="class-data-editor"
            value={data}
            onChange={this.onChange} />

          <p className="ms-TextField-description">
            The contents of this field will be evaluated with the context of a repl and placed in
            the "data" field of the new instance.
          </p>
      </SchemaForm>

      <InstanceInfo instance={instance} />
    </div>
  }
}

export default connect(
  state => ({
    path: selectedDatabase(state).get("path"),
    clazz: selectedClass(state),
    client: faunaClient(state)
  })
)(ClassInstance)
