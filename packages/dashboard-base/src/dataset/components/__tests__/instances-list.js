import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import InstancesList from "../instances-list"

describe("InstancesList Component", () => {
  let comp, onSelectRef

  beforeEach(() => {
    onSelectRef = jest.fn()
    comp = shallow(<InstancesList query={jest.fn()} onSelectRef={onSelectRef} />)
  })

  it("displays instances list", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("displays the selected instance", () => {
    onSelectRef.mockReturnValue(Promise.resolve("a-instance"))
    return comp.find("Connect(Pagination)").props().onSelectRef("a-ref").then(() => {
      comp.update()
      expect(onSelectRef).toHaveBeenCalledWith("a-ref")
      expect(shallowToJson(comp)).toMatchSnapshot()
    })
  })

  it("does NOT display selected ref if no promise is returned", () => {
    onSelectRef.mockReturnValue(null)

    comp.find("Connect(Pagination)").simulate("selectRef", "a-ref")
    expect(onSelectRef).toHaveBeenCalledWith("a-ref")
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("can go back to instances list from instance details view", () => {
    comp.setState({ selectedInstance: "fake-instance" })
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("ComponentWithInjectedProps").simulate("click")
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("does not set onSelectRef for Pagination Component if no handler", () => {
    comp.setProps({ onSelectRef: null })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("resets inner state when query function changes", () => {
    comp.setState({ selectedInstance: "a-instance" })
    comp.setProps({ query: () => null })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})

