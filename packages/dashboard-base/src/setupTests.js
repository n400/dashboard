import thunk from "redux-thunk"
import Immutable from "immutable"
import { createStore, applyMiddleware } from "redux"
import { combineReducers } from "redux-immutable"

// Mock session storage API
const sessionStorage = {
  getItem: null,
  setItem: null,
  clear: null
}

beforeEach(() => {
  sessionStorage.getItem = jest.fn()
  sessionStorage.setItem = jest.fn()
  sessionStorage.clear = jest.fn()
})

// Util for creating redux stores with immutable js
const createImmutableTestStore = (reducers, initialState = {}) => (onStateChanged) => {
  const store = createStore(
    typeof reducers === 'function' ? reducers : combineReducers(reducers),
    Immutable.fromJS(initialState),
    applyMiddleware(thunk)
  )

  const unsubscribe = store.subscribe(() =>
    onStateChanged && onStateChanged(store.getState())
  )

  // Helper to create a copy of this store with a different initial state
  store.withInitialState = (initialState) => {
    unsubscribe()
    return createImmutableTestStore(reducers, initialState)(onStateChanged)
  }

  return store
}

global.sessionStorage = sessionStorage
global.createImmutableTestStore = createImmutableTestStore
