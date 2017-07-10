import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"

import { IndexBrowser } from "../index-browser"

jest.mock("../../../activity-monitor", () => ({ monitorActivity: x => x }))
jest.mock("../../../notifications", () => ({ watchForError: (msg, fn) => fn() }))

describe("IndexBrowser Component", () => {
  let comp, classIndex, nonClassIndex, client

  beforeEach(() => {
    client = {
      query: jest.fn()
    }

    classIndex = Map.of(
      "ref", q.Index("a-index"),
      "terms", List()
    )

    nonClassIndex = Map.of(
      "ref", q.Index("a-index"),
      "terms", List.of(
        Map.of("field", List.of("data", "name"))
      )
    )

    comp = shallow(
      <IndexBrowser
        dispatch={x => x}
        client={client}
        index={classIndex} />
    )
  })

  it("browser a class index", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("select a ref", () => {
    comp.find("InstancesList").simulate("selectRef", q.Ref("fake"))
    expect(client.query).toHaveBeenCalled()
  })

  it("browser non class index", () => {
    comp.setProps({ index: nonClassIndex })
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("ReplEditor").simulate("change", "a name")
    comp.find("ComponentWithInjectedProps").simulate("click")
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
