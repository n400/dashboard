import { Map, List } from "immutable"

const Actions = {
  UPDATE_SELECTED: "@@router/UPDATE_SELECTED"
}

const resourceFor = ({ className, indexName }) => {
  if (className) return Map.of("type", "classes", "name", className)
  if (indexName) return Map.of("type", "indexes", "name", indexName)
  return null
}

export const updateSelectedResource = (params) => (dispatch) => {
  const path = List((params.splat && params.splat.split("/")) || [])
    .filter(elem => elem.trim())

  const resource = Map.of(
    "database", path,
    "resource", resourceFor(params)
  )

  dispatch({
    type: Actions.UPDATE_SELECTED,
    resource
  })

  return resource
}

export const reduceRouter = (state = Map(), action) => {
  switch (action.type) {
    case Actions.UPDATE_SELECTED: return action.resource
    default:                      return state
  }
}
