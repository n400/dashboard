import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import CustomNav from "./custom-nav"
import { selectedDatabase } from "../"
import { faunaClient } from "../../authentication"
import { selectedResource, buildResourceUrl } from "../../router"
import { KeyType } from "../../persistence/faunadb-wrapper"

const buildOptions = (isAdmin, isServer, url) => {
  return [
    isAdmin  && { name: "Create Database", key: "create-database", url },
    isServer && { name: "Create Class", key: "create-class", url: buildResourceUrl(url, "classes") },
    isServer && { name: "Create Index", key: "create-index", url: buildResourceUrl(url, "indexes") },
    isAdmin  && { name: "Manage Keys", key: "manage-keys", url: buildResourceUrl(url, "keys") },
  ].filter(x => x)
}

const onClick = (e, link) => {
  e.preventDefault()
  browserHistory.push(link.url)
}

const asLinks = (items) => items.map(item => ({
  name: item.get("name"),
  key: item.get("url"),
  url: item.get("url")
})).toJS()

export const NavSchema = ({ client, database, resourceUrl }) => {
  const links = [
    {
      name: "Options",
      isExpanded: true,
      links: buildOptions(
        client.hasPrivileges(KeyType.ADMIN),
        client.hasPrivileges(KeyType.SERVER),
        database.get("url")
      )
    },
    {
      name: "Classes",
      isExpanded: true,
      links: asLinks(database.get("classes"))
    },
    {
      name: "Indexes",
      isExpanded: true,
      links: asLinks(database.get("indexes"))
    }
  ]

  return <CustomNav groups={links} selectedKey={resourceUrl} onLinkClick={onClick} />
}

NavSchema.displayName = "NavSchema"

export default connect(
  state => ({
    client: faunaClient(state),
    database: selectedDatabase(state),
    resourceUrl: selectedResource(state).getIn(["resource", "url"])
  })
)(NavSchema)
