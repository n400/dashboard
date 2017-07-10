import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router"
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot"

import KeysForm from "./keys-form"
import KeysList from "./keys-list"
import { selectedDatabase } from "../"
import { buildResourceUrl } from "../../router"

export const KeysManager = ({ database }) => {
  return <div>
      <Pivot>
        <PivotItem linkText="Keys" itemKey="keys">
          {!database.get("isRoot") ?
            <p>
              Keys are located at the container database.
              If you want to grant access to <strong>{database.get("name")}</strong>,
              go to its <Link to={buildResourceUrl(database.getIn(["parent", "url"]), "keys")}>parent</Link> container.
            </p> : null
          }
          <KeysList />
        </PivotItem>
        <PivotItem linkText="Create a Key" itemKey="create">
          <KeysForm />
        </PivotItem>
      </Pivot>
    </div>
}

export default connect(
  state => ({
    database: selectedDatabase(state)
  })
)(KeysManager)
