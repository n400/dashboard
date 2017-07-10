import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import IndexManager from "../index-manager"

it("display index components", () => {
  const comp = shallow(<IndexManager />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})
