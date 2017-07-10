import { Map } from "immutable"
import { createSelector } from "reselect"

const currentUser = state => state.get("currentUser") || Map()

export const faunaClient = createSelector(
  [currentUser],
  user => user.get("client", null)
)

export const intercomSettings = createSelector(
  [currentUser],
  user => user.getIn(["settings", "intercom"], null)
)
