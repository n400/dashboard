import Immutable from "immutable"

import { isBusy } from "../"

describe("isBusy", () => {
  it("should tell if app is busy", () => {
    const busy = isBusy(Immutable.fromJS({
      activityMonitor: {
        isBusy: true
      }
    }))

    expect(busy).toBeTruthy()
  })

  it("should tell if app is NOT busy", () => {
    const busy = isBusy(Immutable.fromJS({
      activityMonitor: {
        isBusy: false
      }
    }))

    expect(busy).toBeFalsy()
  })
})
