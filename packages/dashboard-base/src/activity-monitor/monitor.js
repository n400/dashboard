import { Map } from "immutable"

const Actions = {
  SET_BUSY: "@@activityMonitor/SET_BUSY",
  SET_FREE: "@@activityMonitor/SET_FREE"
}

const isBusy = (getState) => getState().getIn(["activityMonitor", "isBusy"])

const setBusy = (dispatch, getState) => {
  if (!isBusy(getState)) {
    dispatch({
      type: Actions.SET_BUSY
    })
  }
}

const setFree = (dispatch, getState) => {
  if (isBusy(getState)) {
    dispatch({
      type: Actions.SET_FREE
    })
  }
}

export const monitorActivity = (action) => (dispatch, getState) => {
  setBusy(dispatch, getState)

  return dispatch(action).then(result => {
    setFree(dispatch, getState)
    return result
  }).catch(error => {
    setFree(dispatch, getState)
    throw error
  })
}

export const reduceActivityMonitor = (state = Map.of("isBusy", false), action) => {
  switch (action.type) {
    case Actions.SET_BUSY: return state.set("isBusy", true)
    case Actions.SET_FREE: return state.set("isBusy", false)
    default:               return state
  }
}
