import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { List, Map } from "immutable"

import { NotificationBar } from "../notification-bar"

it("renders empty", () => {
  const comp = shallow(<NotificationBar notifications={List()}/>)
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("displays notifications", () => {
  const comp = shallow(
    <NotificationBar notifications={List.of(
      Map.of("type", "error", "message", "an error"),
      Map.of("type", "success", "message", "a success"),
      Map.of("type", "warning", "message", "a warning"),
      Map.of("type", "info", "message", "an info")
    )}/>
  )

  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("breaks lines", () => {
  const comp = shallow(
    <NotificationBar notifications={List.of(
      Map.of("type", "error", "message", "an\nerror"),
    )}/>
  )

  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("accept html tags", () => {
  const comp = shallow(
    <NotificationBar notifications={List.of(
      Map.of("type", "error", "message", <span>an error</span>),
    )}/>
  )

  expect(shallowToJson(comp)).toMatchSnapshot()
})
