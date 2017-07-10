import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { NavSchema } from "../nav-schema"
import { KeyType } from "../../../persistence/faunadb-wrapper"

jest.mock("react-router", () => ({
  browserHistory: {
    push: jest.fn()
  }
}))

const { browserHistory } = require("react-router")

describe("NavSchema Component", () => {
  let comp, client

  beforeEach(() => {
    const database = Map.of(
      "url", "/db/databases",
      "classes", List.of(Map.of("name", "a-class", "url", "/db/classes/a-class")),
      "indexes", List.of(Map.of("name", "a-index", "url", "/db/indexes/a-index")),
    )

    client = { hasPrivileges: jest.fn(() => true) }
    comp = shallow(<NavSchema client={client} database={database} />)
  })

  it("should render classes and indexes", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should hide admin options when using a server key", () => {
    client.hasPrivileges.mockImplementation(type => type === KeyType.SERVER)
    comp.setProps({ client })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("navigates to the clicked resource", () => {
    comp.simulate("linkClick", new Event("click"), { url: "resource-url" })
    expect(browserHistory.push).toHaveBeenCalledWith("resource-url")
  })
})
