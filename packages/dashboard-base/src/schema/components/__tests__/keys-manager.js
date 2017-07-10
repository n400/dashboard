import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { KeysManager } from "../keys-manager"

it("should render for root db", () => {
  const db = Map.of(
    "isRoot", true,
    "name", "/",
    "parent", null
  )

  const comp = shallow(<KeysManager database={db} />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("should keys containment message when not a root database", () => {
  const db = Map.of(
    "isRoot", false,
    "name", "subdb",
    "parent", Map.of(
      "url", "/db/parent/databases"
    )
  )

  const comp = shallow(<KeysManager database={db} />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})
