import { login, logout, restoreUserSession, reduceUserSession, } from "../"

jest.mock("../../persistence/faunadb-wrapper", () => ({
  discoverKeyType() {
    return Promise.resolve("mockedClient")
  }
}))

jest.mock("../../persistence/session-storage", () => ({
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn()
}))

const SessionStorage = require("../../persistence/session-storage")

describe("Given a user store", () => {
  let store, currentUser

  beforeEach(() => {
    currentUser = null
    store = createImmutableTestStore({ currentUser: reduceUserSession })(state => {
      const user = state.get("currentUser")
      currentUser = user ? user.toJS() : null
    })
  })

  it("should be able to login with endpoint and secret", () => {
    return store.dispatch(login("localhost:8443/", "secret")).then(() => {
      expect(currentUser).toEqual({
        endpoint: "localhost:8443/",
        secret: "secret",
        client: "mockedClient"
      })

      expect(SessionStorage.set).toHaveBeenCalledWith("loggedInUser", {
        endpoint: "localhost:8443/",
        secret: "secret"
      })
    })
  })

  it("should be able to restore user session", () => {
    SessionStorage.get.mockReturnValue({
      endpoint: "somewhere",
      secret: "123"
    })

    return store.dispatch(restoreUserSession()).then(() => {
      expect(currentUser).toEqual({
        endpoint: "somewhere",
        secret: "123",
        client: "mockedClient"
      })
    })
  })

  describe("when there is a anonymous user logged in", () => {
    beforeEach(() => {
      currentUser = {
        endpoint: "localhost",
        secret: "123",
        client: "mockedClient"
      }

      store = store.withInitialState({ currentUser })
    })

    it("should be able to logout", () => {
      store.dispatch(logout())
      expect(currentUser).toBeNull()
      expect(SessionStorage.clear).toHaveBeenCalled()
    })
  })
})
