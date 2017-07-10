import sessionStorage from '../session-storage'

const testData = { "test-data": 42 }

describe("When session storage api is available", () => {
  it("should save an object to session storate", () => {
    sessionStorage.set("test", testData)
    expect(window.sessionStorage.setItem).toBeCalledWith("test", '{"test-data":42}')
  })

  it("should load an object from session storage", () => {
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(testData))
    expect(sessionStorage.get("test")).toEqual(testData)
    expect(window.sessionStorage.getItem).toBeCalledWith("test")
  })

  it("should clear session storate", () => {
    sessionStorage.clear()
    expect(window.sessionStorage.clear).toBeCalled()
  })
})

describe("When session storage api os NOT available", () => {
  beforeEach(() => window.sessionStorage = null)

  it("should not fail when trying to save an object", () => {
    sessionStorage.set("test", testData)
  })

  it("should return undefined when trying to load an object", () => {
    expect(sessionStorage.get("test")).toBeUndefined()
  })

  it("should return undefined when trying to clear the session storage", () => {
    expect(sessionStorage.clear()).toBeUndefined()
  })
})
