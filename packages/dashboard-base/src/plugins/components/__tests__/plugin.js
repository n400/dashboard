import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { Outlet, Plugin } from "../plugin"

it("should render a plugin", () => {
  const comp = shallow(
    <Outlet name="plugin-goes-here">
      <h1>Default content</h1>
    </Outlet>
  )
  expect(shallowToJson(comp)).toMatchSnapshot()

  const plugin = shallow(
    <Plugin name="fake-plugin" outlet="plugin-goes-here">
      <h1>I will appear at "plugin-goes-here"</h1>
    </Plugin>
  )

  comp.update() // Force test wrapper to fetch plugin changes on the outlet component
  expect(shallowToJson(plugin)).toMatchSnapshot()
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("should render an empty outlet if no default content", () => {
  const comp = shallow(<Outlet name="plugin-goes-here" />)
  expect(shallowToJson(comp)).toMatchSnapshot()
})
