import Immutable from "immutable"

import { faunaClient, currentUser } from "../"

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

describe("currentUser", () => {
  it("returns logged in user", () => {
    const state = Immutable.fromJS({ currentUser: "logged-in-user" })
    expect(currentUser(state)).toEqual("logged-in-user")
  })

  it("returns null if no logged in user", () => {
    const state = Immutable.fromJS({ currentUser: null })
    expect(currentUser(state)).toBeNull()
  })
})
