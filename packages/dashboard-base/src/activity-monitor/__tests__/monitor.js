import { reduceActivityMonitor, monitorActivity } from "../"

describe("Given a activity monitor store", () => {
  let store, isBusy

  beforeEach(() => {
    isBusy = false
    store = createImmutableTestStore({ activityMonitor: reduceActivityMonitor })(
      state => isBusy = state.getIn(["activityMonitor", "isBusy"])
    )
  })

  it("should mark as busy during operation", () => {
    return store.dispatch(
      monitorActivity(() => {
        expect(isBusy).toBeTruthy()
        return Promise.resolve(42)
      })
    ).then(result => {
      expect(isBusy).toBeFalsy()
      expect(result).toEqual(42)
    })
  })

  it("should set free on failure", () => {
    return store.dispatch(
      monitorActivity(() => {
        expect(isBusy).toBeTruthy()
        return Promise.reject(new Error("Fail"))
      })
    ).catch(error => {
      expect(isBusy).toBeFalsy()
      expect(error).toEqual(new Error("Fail"))
    })
  })
})
