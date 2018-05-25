import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"
import { values as v } from "faunadb"

import { KeysList } from "../keys-list"

jest.mock("../../../activity-monitor", () => ({ monitorActivity: x => x }))
jest.mock("../../../notifications", () => ({ watchForError: (msg, fn) => fn() }))
jest.mock("react-router", () => ({ browserHistory: { push: jest.fn() } }))

const { browserHistory } = require("react-router")

describe("KeysList Component", () => {
  let comp, client

  beforeEach(() => {
    client = {
      query: jest.fn(() =>
        Promise.resolve("fake-key")
      )
    }

    comp = shallow(
      <KeysList
        dispatch={x => x}
        client={client}
        path={["a-db"]}
        url="/db/a-db/databases" />
    )
  })

  it("should render an empty page", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("fetches keys", () => {
    comp.find("InstancesList").props().query()
    expect(client.query).toHaveBeenCalled()
  })

  it("fetch a key when clicked", () => {
    comp.find("InstancesList").simulate("selectRef", new v.Ref("123", v.Native.KEYS))
    expect(client.query).toHaveBeenCalled()
  })

  it("redirect to database when database ref is cliekced", () => {
    comp.find("InstancesList").simulate("selectRef", new v.Ref("my-blog", v.Native.DATABASES))
    expect(browserHistory.push).toHaveBeenCalledWith("/db/a-db/my-blog/databases")
  })
})
