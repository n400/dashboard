import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { Container } from "../app"

describe("Container Component", () => {
  let comp, client

  beforeEach(() => {
    client = { hasPrivileges: jest.fn(() => true) }
    comp = shallow(<Container client={client} />)
  })

  it("displays the base layout", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("renders a smaller sidebar when using a server key", () => {
    client.hasPrivileges.mockReturnValue(false)
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
