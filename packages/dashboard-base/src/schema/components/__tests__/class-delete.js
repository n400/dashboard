import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { ClassDelete } from "../class-delete"

jest.mock("../../../notifications", () => ({
  notify: (msg, fn) => fn(() => Promise.resolve())
}))

jest.mock("react-router", () => ({
  browserHistory: { push: jest.fn() }
}))

const { browserHistory } = require("react-router")

describe("ClassDelete Component", () => {
  let comp, store, client

  beforeEach(() => {
    comp = shallow(
      <ClassDelete
        client={client}
        path={["a-db"]}
        clazz={Map.of("name", "fake-class")}
        dbUrl="/db/a-db/databases" />
    )
  })

  it("renders delete form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("delete class", () => {
    return comp.props().onDelete().then(() => {
      expect(browserHistory.push).toHaveBeenCalledWith("/db/a-db/classes")
    })
  })
})

