import { Map, List } from "immutable"
import { createSelector } from "reselect"

import { buildResourceUrl } from "."

const databasePath = state => state.getIn(["router", "database"], List())
const resource = state => state.getIn(["router", "resource"])

export const selectedResource = createSelector([databasePath, resource], (path, resource) => {
  const url = buildResourceUrl(null, path, "databases")
  const parentPath = path.butLast()

  return Map.of(
    "database", Map.of(
      "path", path,
      "url", url,
      "parent", Map.of(
        "path", parentPath,
        "url", buildResourceUrl(null, parentPath, "databases")
      )
    ),
    "resource", resource && Map.of(
      "url", buildResourceUrl(url, resource.get("type"), resource.get("name")),
      "name", resource.get("name"),
      "type", resource.get("type")
    )
  )
})
