import React from "react"
import { connect } from "react-redux"
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar"

import "./notification-bar.css"
import { NotificationType } from "../"

const messageBarTypeFor = (notificationType) => {
  switch (notificationType) {
    case NotificationType.ERROR:   return MessageBarType.error
    case NotificationType.SUCCESS: return MessageBarType.success
    case NotificationType.WARNING: return MessageBarType.warning
    default:                       return MessageBarType.info
  }
}

const breakLines = (text) => (typeof text !== "string") ?  text :
  text.split("\n").map((text, key) =>
    <span key={key}>
      {text}
      <br/>
    </span>
  )

export const NotificationBar = ({ notifications }) => {
  return <div className="notification-bar ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-mdPush3">
      <ul>{
      notifications.map((notification, index) => (
        <li key={index} className="ms-u-fadeIn100">
          <MessageBar
            messageBarType={messageBarTypeFor(notification.get("type"))}>
            { breakLines(notification.get("message")) }
          </MessageBar>
        </li>
      ))
    }</ul>
  </div>
}

NotificationBar.displayName = "NotificationBar"

export default connect(
  state => ({
    notifications: state.get("notifications")
  })
)(NotificationBar)

