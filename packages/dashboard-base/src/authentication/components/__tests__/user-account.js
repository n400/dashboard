import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { UserAccount } from "../user-account"

describe("UserAccount Component", () => {
  let comp, dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    comp = shallow(<UserAccount dispatch={dispatch} />)
  })

  it("should show and hide context menu on click", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("ComponentWithInjectedProps").simulate("click", { target: "mocked" })
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("WithResponsiveMode").simulate("dismiss")
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should logout", () => {
    comp.setState({ menuVisible: true })

    comp
      .find("WithResponsiveMode")
      .prop("items")
      .filter(i => i.key === "logout-btn")[0]
      .onClick()

    expect(dispatch).toHaveBeenCalled()
  })
})
