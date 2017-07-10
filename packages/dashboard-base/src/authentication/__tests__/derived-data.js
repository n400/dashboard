import Immutable from "immutable"

import { faunaClient, intercomSettings } from "../"

describe("faunaClient", () => {
  it("returns fauna client for the logged in user", () => {
    const state = Immutable.fromJS({
      currentUser: {
        client: "mockedClient"
      }
    })

    expect(faunaClient(state)).toEqual("mockedClient")
  })

  it("returns null when no logged in user", () => {
    const state = Immutable.fromJS({ currentUser: null })
    expect(faunaClient(state)).toBeNull()
  })
})

describe("intercomSettings", () => {
  it("returns logged in user", () => {
    const state = Immutable.fromJS({
      currentUser: {
        client: "mockedClient",
        settings: {
          intercom: {
            "app_id": "123"
          }
        }
      }
    })

    expect(intercomSettings(state).toJS()).toEqual({
      "app_id": "123"
    })
  })

  it("returns null when no logged in user", () => {
    const state = Immutable.fromJS({ currentUser: null })
    expect(intercomSettings(state)).toBeNull()
  })

  it("returns null when no intercom settings available for current user", () => {
    const state = Immutable.fromJS({ currentUser: { settings: {} } })
    expect(intercomSettings(state)).toBeNull()
  })
})
