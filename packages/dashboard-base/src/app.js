import Immutable from "immutable"
import ReactGA from "react-ga"
import React, { Component } from "react"
import { Provider, connect } from "react-redux"
import { Router, IndexRoute, Route, Redirect, Link, browserHistory } from "react-router"

import "./app.css"
import logo from "./logo.svg"
import GetStarted from "./get-started"
import { ToggleRepl } from "./repl"
import { updateSelectedResource } from "./router"
import { ActivityMonitor, monitorActivity } from "./activity-monitor"
import { NotificationBar, watchForError } from "./notifications"
import { LoginForm, UserAccount, faunaClient } from "./authentication"
import { IntercomWidget } from "./external/intercom"
import { KeyType } from "./persistence/faunadb-wrapper"

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
                  <li><a href="http://fauna.com/tutorials" target="_blank" rel="noopener noreferrer">Tutorials</a></li>
                  <li><a href="http://fauna.com/documentation" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                  <li><a href="https://fauna.com/resources#drivers" target="_blank" rel="noopener noreferrer">Drivers</a></li>
                  <li><UserAccount /></li>
                </ul>
              </div>
            </div>
            { this.props.faunaClient ? this.renderMainView() : null }
          </div>
        </ToggleRepl>
        <NotificationBar />
        <LoginForm />
        <IntercomWidget />
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

export default class App extends Component {

  static Container = connect(
    state => ({
      faunaClient: faunaClient(state)
    })
  )(Container)

  static NotFound = () => <h1>404.. This page is not found!</h1>
  static isProduction = process.env.NODE_ENV === "production"

  // FIXME: GA should be extract as a plugin for could users only
  componentDidMount() {
    if (App.isProduction) {
      ReactGA.initialize("UA-51914115-2")
    }
  }

  trackPage() {
    if (App.isProduction) {
      ReactGA.set({ page: window.location.pathname })
      ReactGA.pageview(window.location.pathname)
    }
  }

  render() {
    return <Provider store={this.props.store}>
        <Router onUpdate={this.trackPage.bind(this)} history={browserHistory}>
          <Redirect from="/" to="/db" />
          <Route path="/db" component={App.Container}>
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
          <Route path="*" component={App.NotFound} />
        </Router>
      </Provider>
  }
}
