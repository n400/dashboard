import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { ActivityMonitor } from "../activity-monitor"

it("should turn spinner ON when monitoring activity", () => {
  const comp = shallow(<ActivityMonitor isBusy={true} /> )
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("should turn spinner OFF when NOT monitoring activity", () => {
  const comp = shallow(<ActivityMonitor isBusy={false} /> )
  expect(shallowToJson(comp)).toMatchSnapshot()
})
