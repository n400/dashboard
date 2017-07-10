import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { IndexDelete } from "../index-delete"

jest.mock("../../../notifications", () => ({
  notify: (msg, fn) => fn(() => Promise.resolve())
}))

jest.mock("react-router", () => ({
  browserHistory: { push: jest.fn() }
}))

const { browserHistory } = require("react-router")

describe("IndexDelete Component", () => {
  let comp

  beforeEach(() => {
    const index = Map.of("name", "a-index")
    comp = shallow(<IndexDelete index={index} databaseUrl="/db/databases" />)
  })

  it("display delete form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("deletes the index", () => {
    return comp.find("Connect(DeleteForm)").props().onDelete().then(() => {
      expect(browserHistory.push).toHaveBeenCalledWith("/db/indexes")
    })
  })
})
