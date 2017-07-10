import {
  login,
  logout,
  loginWithCloud,
  restoreUserSession,
  reduceUserSession,
} from "../"

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

jest.mock("js-cookie", () => ({
  remove: jest.fn(),
  get: jest.fn()
}))

const Cookies = require("js-cookie")

jest.mock("superagent", () => {
  const requestMock = {
    get: jest.fn(() => requestMock),
    end: jest.fn(() => requestMock),
    timeout: jest.fn(() => requestMock),
    withCredentials: jest.fn(() => requestMock)
  }

  return requestMock
})

const request = require("superagent")

describe("Given a user store", () => {
  let store, currentUser

  beforeEach(() => {
    currentUser = null
    store = createImmutableTestStore({ currentUser: reduceUserSession })(state => {
      const user = state.get("currentUser")
      currentUser = user ? user.toJS() : null
    })
  })

  it("should be able to login with an anonymous user", () => {
    return store.dispatch(login("localhost:8443/", "secret")).then(() => {
      expect(currentUser).toEqual({
        endpoint: "localhost:8443/",
        secret: "secret",
        client: "mockedClient",
        settings: {}
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
        client: "mockedClient",
        settings: {}
      })
    })
  })

  it("should be able to use cloud authentication", () => {
    Cookies.get.mockReturnValue("abc123")

    request.end.mockImplementation(callback => callback(null, {
      ok: true,
      body: {
        endpoint: "localhost",
        secret: "secret",
        userId: "123",
        email: "test@example.com",
        flags: {
          acceptedTos: true,
          paymentSet: true
        },
        settings: {
          intercom: {
            appId: "ap123",
            userHash: "hash123"
          }
        }
      }
    }))

    return store.dispatch(loginWithCloud()).then(loggedIn => {
      expect(currentUser).toEqual({
        endpoint: "localhost",
        secret: "secret",
        client: "mockedClient",
        settings: {
          logoutUrl: "http://localhost:3000/logout",
          paymentUrl: "http://localhost:3000/account/billing",
          acceptedTos: true,
          paymentSet: true,
          intercom: {
            app_id: "ap123",
            user_hash: "hash123",
            user_id: "123",
            email: "test@example.com"
          }
        }
      })

      expect(loggedIn).toBeTruthy()
    })
  })

  it("should NOT login with cloud if no auth cookie", () => {
    Cookies.get.mockReturnValue(undefined)

    return store.dispatch(loginWithCloud()).then(loggedIn => {
      expect(currentUser).toBeNull()
      expect(loggedIn).toBeFalsy()
    })
  })

  it("should not login with could if auth request fail", () => {
    Cookies.get.mockReturnValue("abc123")
    request.end.mockImplementation(callback => callback(null, { ok: false }))

    return store.dispatch(loginWithCloud()).catch(() => {
      expect(currentUser).toBeNull()
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
      const url = store.dispatch(logout())

      expect(currentUser).toBeNull()
      expect(url).toEqual("/")
      expect(Cookies.remove).toHaveBeenCalledWith("dashboard")
      expect(SessionStorage.clear).toHaveBeenCalled()
    })
  })

  describe("when there is a cloud user logged in", () => {
    beforeEach(() => {
      currentUser = {
        endpoint: "localhost",
        secret: "123",
        client: "mockedClient",
        settings: {
          logoutUrl: "https://fauna.com/logout"
        }
      }

      store = store.withInitialState({ currentUser })
    })

    it("should be able to logout", () => {
      const url = store.dispatch(logout())

      expect(currentUser).toBeNull()
      expect(url).toEqual("https://fauna.com/logout")
      expect(Cookies.remove).toHaveBeenCalledWith("dashboard")
      expect(SessionStorage.clear).toHaveBeenCalled()
    })
  })
})
