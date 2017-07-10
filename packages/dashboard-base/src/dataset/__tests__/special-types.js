import { values as v } from "faunadb"

import { renderSpecialType } from "../special-types"

describe("When rendering special fauna types", () => {
  it("should render Ref", () => {
    expect(renderSpecialType(new v.Ref("classes/people")))
      .toEqual('q.Ref("classes/people")')
  })

  it("should render @ref", () => {
    expect(renderSpecialType({ "@ref": "classes/people" }))
      .toEqual('q.Ref("classes/people")')
  })

  it("should render FaunaDate", () => {
    expect(renderSpecialType(new v.FaunaDate(new Date("1990-01-23"))))
      .toEqual('q.Date("1990-01-23")')
  })

  it("should render @date", () => {
    expect(renderSpecialType({ "@date": "1990-01-23" }))
      .toEqual('q.Date("1990-01-23")')
  })

  it("should render FaunaTime", () => {
    expect(renderSpecialType(new v.FaunaTime("1970-01-01T00:00:12Z")))
      .toEqual('q.Time("1970-01-01T00:00:12Z")')
  })

  it("should render @ts", () => {
    expect(renderSpecialType({ "@ts": "1970-01-01T00:00:12Z"}))
      .toEqual('q.Time("1970-01-01T00:00:12Z")')
  })

  it("returns null", () => {
    expect(renderSpecialType(null)).toBeNull()
    expect(renderSpecialType(undefined)).toBeNull()
  })
})
