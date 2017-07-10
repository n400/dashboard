import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { ClassInfo } from "../class-info"

describe("ClassInfo Component", () => {
  let clazz

  beforeEach(() => {
    clazz = Map.of(
      "name", "fake-class",
      "historyDays", 30,
      "ttlDays", 10,
      "indexes", List.of(
        Map.of(
          "name", "all_fake-class",
          "url", "/db/indexes/all_fake-class"
        )
      )
    )
  })

  it("renders class details", () => {
    const comp = shallow(<ClassInfo clazz={clazz} />)
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("renders class when no history or ttl", () => {
    const clazzWithNoHistory = clazz
      .set("historyDays", null)
      .set("ttlDays", null)

    const comp = shallow(<ClassInfo clazz={clazzWithNoHistory} />)
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
