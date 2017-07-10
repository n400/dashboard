import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import DeleteForm from "./delete-form"
import { selectedIndex, selectedDatabase, deleteIndex } from "../"
import { buildResourceUrl } from "../../router"
import { faunaClient } from "../../authentication"
import { notify } from "../../notifications"
import { Events } from "../../plugins"

export const IndexDelete = ({ client, index, path, databaseUrl }) => {
  const onDelete = () => {
    Events.fire("@@schema/updated", { resource: "index", action: "delete" })
    return notify("Index deleted successfully", dispatch =>
      dispatch(deleteIndex(client, path, index.get("name"))).then(() =>
        browserHistory.push(buildResourceUrl(databaseUrl, "indexes"))
      )
    )
  }

  return <DeleteForm
    buttonText="Delete Index"
    type="index"
    title={`Delete ${index.get("name")}`}
    validateName={index.get("name")}
    onDelete={onDelete} />
}

export default connect(
  state => ({
    client: faunaClient(state),
    index: selectedIndex(state),
    path: selectedDatabase(state).get("path"),
    databaseUrl: selectedDatabase(state).get("url")
  })
)(IndexDelete)
