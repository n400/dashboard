import React from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { browserHistory } from "react-router"

import { selectedDatabase } from "../"
import { watchForError } from "../../notifications"
import { monitorActivity } from "../../activity-monitor"
import { faunaClient } from "../../authentication"
import { buildResourceUrl } from "../../router"
import { InstancesList } from "../../dataset"
import { KeyType } from "../../persistence/faunadb-wrapper"

export const KeysList = ({ dispatch, client, path, url }) => {
  const listKeys = options => client.query(path, KeyType.ADMIN,
    q.Map(
      q.Paginate(q.Ref("keys"), options),
      ref => q.Let({ key: q.Get(ref) }, key => ({
        "Name": q.Select(["data", "name"], key, null),
        "Role": q.Select("role", key),
        "Database": q.Select("database", key),
        "Ref": ref
      }))
    )
  )

  const onRefSelected = ref => {
    if (ref.class && ref.class.id === "keys") {
      return dispatch(
        monitorActivity(
          watchForError("Error when fetching key information", () =>
            client.query(path, KeyType.ADMIN, q.Get(ref))
          )
        )
      )
    }

    browserHistory.push(
      buildResourceUrl(url, ref.id, "databases")
    )
  }

  return <InstancesList query={listKeys} onSelectRef={onRefSelected} />
}

KeysList.displayName = "KeysList"

export default connect(
  state => ({
    client: faunaClient(state),
    path: selectedDatabase(state).get("path"),
    url: selectedDatabase(state).get("url")
  })
)(KeysList)
