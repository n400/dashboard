import { createSelector } from "reselect"

export const currentUser = state => state.get("currentUser")
export const faunaClient = createSelector([currentUser], user => user ? user.get("client", null) : null)
