import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router"

import { selectedClass } from "../"

export const ClassInfo = ({ clazz }) => {
  const days = (value) => value !== null ? `${value} days` : ""

  return <div>
    <h3>Class Details</h3>
    <dl>
      <dt>Name</dt><dd>{clazz.get("name")}</dd>
      <dt>History</dt><dd>{days(clazz.get("historyDays"))}</dd>
      <dt>TTL</dt><dd>{days(clazz.get("ttlDays"))}</dd>

      <dt>Covering Indexes</dt>
      {clazz.get("indexes").map(index => (
        <dd key={index.get("url")}>
          <Link to={index.get("url")}>{index.get("name")}</Link>
        </dd>
      ))}
    </dl>
  </div>
}

ClassInfo.displayName = "ClassInfo"

export default connect(
  state => ({
    clazz: selectedClass(state)
  })
)(ClassInfo)
