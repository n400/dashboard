import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { NavTree } from "../nav-tree"

it("displays db and schema tree when using admin key", () => {
  const comp = shallow(<NavTree client={{ hasPrivileges: () => true }} />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("does not display db tree when using server key", () => {
  const comp = shallow(<NavTree client={{ hasPrivileges: () => false }} />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})
