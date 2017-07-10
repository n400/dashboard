import React, { Component } from "react"
import { connect } from "react-redux"
import { ContextualMenu } from "office-ui-fabric-react/lib/ContextualMenu"
import { DirectionalHint } from "office-ui-fabric-react/lib/Callout"
import { IconButton } from "office-ui-fabric-react/lib/Button"

import { logout } from "../"

export class UserAccount extends Component {

  constructor(props) {
    super(props)
    this.state = { showMenu: false }
  }

  showMenu(e) {
    this.setState({
      target: e.target,
      menuVisible: true
    })
  }

  hideMenu() {
    this.setState({ menuVisible: false })
  }

  logout() {
    window.location = this.props.dispatch(logout())
  }

  render() {
    const { target, menuVisible } = this.state

    return <div>
        <IconButton
        iconProps={{ iconName: 'Contact' }}
        description="Log out"
        onClick={this.showMenu.bind(this)} />

      {menuVisible ?
        <ContextualMenu
          targetElement={target}
          shouldFocusOnMount={true}
          onDismiss={this.hideMenu.bind(this)}
          directionalHint={DirectionalHint.bottomCenter}
          items={[
            {
              key: "logout-btn",
              name: "Log out",
              icon: "OutOfOffice",
              onClick: this.logout.bind(this)
            }
          ]} /> : null
      }
      </div>
  }
}

export default connect()(UserAccount)
