import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { IndexInfo } from "../index-info"

it("displays index information", () => {
  const index = Map.of(
    "name", "a-index",
    "source", Map.of(
      "name", "a-class",
      "url", "/db/a-db/a-class"
    ),
    "active", true,
    "unique", false,
    "partitions", 10,
    "terms", List.of(
      Map.of(
        "field", List.of("data", "name"),
        "transform", "casefold"
      )
    ),
    "values", List.of(
      Map.of("field", List.of("ref"))
    )
  )

  const comp = shallow(<IndexInfo index={index} />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})
