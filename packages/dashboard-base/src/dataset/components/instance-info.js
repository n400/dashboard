import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot"
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar"
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button"

import { Pagination } from "../"
import { stringify } from "../stringify"
import { renderSpecialType } from "../special-types"
import { selectedDatabase } from "../../schema"
import { notify } from "../../notifications"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { faunaClient } from "../../authentication"
import { ReplEditor, evalQuery } from "../../repl"
import { KeyType } from "../../persistence/faunadb-wrapper"

class InstanceInfo extends Component {

  static defaultProps = {
    keyType: KeyType.SERVER
  }

  constructor(props) {
    super(props)
    this.state = this.initialState(props)
  }

  initialState(props) {
    return {
      instance: props.instance,
      instanceData: stringify((props.instance && props.instance.data) || {}),
      historyQuery: null,
      isDeleteConfirmationOpen: false
    }
  }

  reset(props) {
    this.setState(this.initialState(props))
  }

  componentDidMount() {
    this.reset(this.props)
  }

  componentWillReceiveProps(next) {
    if (this.props.instance !== next.instance) {
      this.reset(next)
    }
  }

  tabSelected(item) {
    if (item.props.itemKey === "history" && !this.state.historyQuery) {
      // Pivot callback can't change component's state
      // on the current thread
      setTimeout(() => {
        this.setState({
          historyQuery: this.buildHistoryQuery()
        })
      })
    }
  }

  buildHistoryQuery() {
    const { client, path, keyType } = this.props
    const { instance } = this.state

    return options => client.query(path, keyType,
      q.Map(
        q.Paginate(instance.ref, { events: true, ...options }),
        event => ({
          action: q.Select("action", event),
          ts: q.Select("ts", event),
          data: q.Select("data", q.Get(instance.ref, q.Select("ts", event)), null)
        })
      ))
  }

  updateInstanceData(instanceData) {
    this.setState({ instanceData })
  }

  updateInstance(e) {
    e.preventDefault()

    const { client, path, keyType } = this.props
    const { instance, instanceData } = this.state

    this.props.dispatch(
      monitorActivity(
        notify("Instance updated successfully", () =>
          evalQuery(data =>
            client.query(path, keyType,
              q.Update(instance.ref, { data })
            )
          )(instanceData)
        )
      )
    ).then(
      instance => this.reset({ instance })
    )
  }

  openDeleteConfirmation(e) {
    e.preventDefault()
    this.setState({ isDeleteConfirmationOpen: true })
  }

  closeDeleteConfirmation(e) {
    e.preventDefault()
    this.setState({ isDeleteConfirmationOpen: false })
  }

  deleteInstance(e) {
    e.preventDefault()

    const { client, path, keyType } = this.props
    const { instance } = this.state

    this.props.dispatch(
      monitorActivity(
        notify("Instance deleted successfully", () =>
          client.query(path, keyType, q.Delete(instance.ref))
        )
      )
    ).then(
      () => this.reset({ instance: null })
    )
  }

  render() {
    const { isBusy } = this.props

    const {
      instance,
      instanceData,
      historyQuery,
      isDeleteConfirmationOpen
    } = this.state

    if (!instance) return null

    return <div>
        <h3>Instance Details</h3>
        <Pivot key={instance.ts} onLinkClick={this.tabSelected.bind(this)}>
          <PivotItem linkText="Preview" itemKey="preview">
            <dl>
              <dt>Ref</dt><dd>{renderSpecialType(instance.ref)}</dd>
              <dt>Class</dt><dd>{renderSpecialType(instance.class)}</dd>
              <dt>TS</dt><dd>{instance.ts}</dd>
              <dt>Data</dt>
              <dd>
                <pre>{stringify(instance.data)}</pre>
              </dd>
            </dl>
          </PivotItem>
          <PivotItem linkText="Edit" itemKey="edit">
            <ReplEditor
              mode={ReplEditor.Mode.TEXT_AREA}
              name="instance-data-editor"
              value={instanceData}
              onChange={this.updateInstanceData.bind(this)} />

            <p className="ms-TextField-description">
              The contents of this field will be evaluated with the context of a repl and placed in
              the "data" field of the updated instance.
            </p>

            <PrimaryButton
              disabled={isBusy}
              onClick={this.updateInstance.bind(this)}>
                Update Instance
            </PrimaryButton>

            <DefaultButton
              disabled={isBusy}
              onClick={this.openDeleteConfirmation.bind(this)}>
                Delete Instance
            </DefaultButton>

            {isDeleteConfirmationOpen ?
              <MessageBar
                messageBarType={MessageBarType.severeWarning}
                isMultiline={false}
                actions={
                  <div>
                    <PrimaryButton
                      disabled={isBusy}
                      onClick={this.deleteInstance.bind(this)}>
                      Yes
                    </PrimaryButton>

                    <DefaultButton
                      disabled={isBusy}
                      onClick={this.closeDeleteConfirmation.bind(this)}>
                      No
                    </DefaultButton>
                  </div>
                }>
                Are you sure you want to delete this instance?
              </MessageBar> : null}
          </PivotItem>
          <PivotItem linkText="JS" itemKey="JS">
            <pre>{stringify(instance)}</pre>
          </PivotItem>
          <PivotItem linkText="History" itemKey="history">
            <Pagination query={historyQuery} />
          </PivotItem>
        </Pivot>
      </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    path: selectedDatabase(state).get("path"),
    isBusy: isBusy(state)
  })
)(InstanceInfo)
