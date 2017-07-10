import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { ClassInstance } from "../class-instance"

jest.mock("../../../notifications", () => ({
  notify: (msg, fn) => fn()
}))

describe("ClassInstance Component", () => {
  let comp, client

  beforeEach(() => {
    const clazz = Map.of("name", "fake-class")
    client = { query: jest.fn(() => Promise.resolve({ name: "fake-instance" })) }
    comp = shallow(<ClassInstance client={client} path={["a-db"]} clazz={clazz} />)
  })

  it("renders instance form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("create a new instance", () => {
    comp.find("ReplEditor").simulate("change", "{ 'name': 'Bob' }")
    expect(shallowToJson(comp)).toMatchSnapshot()

    return comp.find("Connect(SchemaForm)").props().onSubmit().then(() => {
      comp.update()
      expect(shallowToJson(comp)).toMatchSnapshot()
    })
  })
})
