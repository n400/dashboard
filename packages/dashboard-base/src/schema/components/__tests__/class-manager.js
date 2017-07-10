import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import ClassManager from "../class-manager"

describe("ClassManager Component", () => {
  it("renders class components", () => {
    const comp = shallow(<ClassManager />)
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
