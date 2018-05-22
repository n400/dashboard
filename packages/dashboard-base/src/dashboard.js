import Immutable from "immutable"
import React, { Component } from "react"
import { Provider, connect } from "react-redux"
import { Router, IndexRoute, Route, Redirect, Link, browserHistory } from "react-router"

import "./dashboard.css"
import logo from "./logo.svg"
import GetStarted from "./get-started"
import reduxStore from "./store"
import { updateSelectedResource } from "./router"
import { ActivityMonitor, monitorActivity } from "./activity-monitor"
import { NotificationBar, watchForError } from "./notifications"
import { LoginForm, UserAccount, faunaClient } from "./authentication"
import { KeyType } from "./persistence/faunadb-wrapper"
import { ToggleRepl } from "./repl"
import { Events, Outlet } from "./plugins"

import {
  NavTree,
  DatabaseForm,
  ClassForm,
  ClassManager,
  IndexForm,
  IndexManager,
  KeysManager,
  loadSchemaTree
} from "./schema"

export class Container extends Component {

  componentWillReceiveProps(next) {
    const oldParams = Immutable.Map(this.props.params)
    const newParams = Immutable.Map(next.params)

    if (this.props.faunaClient !== next.faunaClient || !oldParams.equals(newParams)) {
      this.updateSelectedResource(
        next.faunaClient,
        next.params
      )
    }
  }

  updateSelectedResource(client, params) {
    if (!client) return

    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while loading database. It may not exist or your key can't access it",
          (dispatch) => {
            const selected = dispatch(updateSelectedResource(params))
            return dispatch(loadSchemaTree(client, selected.get("database")))
          }
        )
      )
    )
  }

  render() {
    return <div className="ms-Fabric ms-font-m">
        <ToggleRepl>
          <div className="ms-Grid">
            <div className="ms-Grid-row header">
              <div className="ms-Grid-col ms-u-sm5 ms-u-md6 ms-u-lg3 ms-u-xl2">
                <Link to="/"><img src={logo} alt="logo" /></Link>
              </div>
              <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg9 ms-u-xl10">
                <ul>
                  <li><ActivityMonitor /></li>
                  <li><a href="http://fauna.com/documentation" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                  <li><UserAccount /></li>
                </ul>
              </div>
            </div>
            { this.props.faunaClient ? this.renderMainView() : null }
          </div>
        </ToggleRepl>
        <NotificationBar />
        <Outlet name="@@dashboard/authentication">
          <LoginForm />
        </Outlet>
        <Outlet name="@@dashboard/after-application-content" />
      </div>
  }

  renderMainView() {
    if (this.props.faunaClient.hasPrivileges(KeyType.ADMIN)) {
      return <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg4">
          <NavTree />
        </div>
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
          {this.props.children}
        </div>
      </div>
    }

    return <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-u-sm12 ms-u-md3 ms-u-lg2">
        <NavTree />
      </div>
      <div className="ms-Grid-col ms-u-sm12 ms-u-md9 ms-u-lg10">
        {this.props.children}
      </div>
    </div>
  }
}

export default class Dashboard extends Component {

  static Container = connect(
    state => ({
      faunaClient: faunaClient(state)
    })
  )(Container)

  static NotFound = () => <h1>404.. This page is not found!</h1>
  static isProduction = process.env.NODE_ENV === "production"

  constructor(props) {
    super(props)
    this.firePageChanged = this.firePageChanged.bind(this)
  }

  firePageChanged() {
    Events.fire("@@dashboard/page-changed", {
      pathname: window.location.pathname
    })
  }

  render() {
    return <div>
      {/* Entrypoint for rendering external plugins.
        * This must be the first call to ensure plugins are declared before their outlets
        * so that their outlets are able to render default content if no plugin was declared.
        */}
      { this.props.children }
      <Provider store={reduxStore}>
        <Router onUpdate={this.firePageChanged} history={browserHistory}>
          <Redirect from="/" to="/db" />
          <Route path="/db" component={Dashboard.Container}>
            <Route path="indexes/:indexName" component={IndexManager} />
            <Route path="indexes" component={IndexForm} />
            <Route path="classes/:className" component={ClassManager} />
            <Route path="classes" component={ClassForm} />
            <Route path="databases" component={DatabaseForm} />
            <Route path="keys" component={KeysManager} />
            <Route path="**/indexes/:indexName" component={IndexManager} />
            <Route path="**/indexes" component={IndexForm} />
            <Route path="**/classes/:className" component={ClassManager} />
            <Route path="**/classes" component={ClassForm} />
            <Route path="**/databases" component={DatabaseForm} />
            <Route path="**/keys" component={KeysManager} />
            <IndexRoute component={GetStarted} />
          </Route>
          <Route path="*" component={Dashboard.NotFound} />
        </Router>
      </Provider>
    </div>
  }
}
