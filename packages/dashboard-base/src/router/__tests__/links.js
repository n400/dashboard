import { query as q } from "faunadb"

import { buildResourceUrl, linkForRef } from "../"

describe("buildResourceUrl", () => {
  it("builds a root url", () => {
    expect(buildResourceUrl(null, "classes")).toEqual("/db/classes")
    expect(buildResourceUrl(null, "classes", "a-class")).toEqual("/db/classes/a-class")
  })

  it("builds a nested url", () => {
    expect(buildResourceUrl("/db/db-test/databases", "classes")).toEqual("/db/db-test/classes")
    expect(buildResourceUrl("/db/db-test/databases", "classes", "a-class")).toEqual("/db/db-test/classes/a-class")
  })

  it("builds deep nested url s", () => {
    expect(buildResourceUrl(null, ["parent", "child"], "classes"))
      .toEqual("/db/parent/child/classes")

    expect(buildResourceUrl(null, ["parent", "child"], ["classes", "a-class"]))
      .toEqual("/db/parent/child/classes/a-class")
  })

  it("encode URI", () => {
    expect(buildResourceUrl("/db/db%251/databases", "classes", "a%test"))
      .toEqual("/db/db%251/classes/a%25test")
  })
})

describe("linkForRef", () => {
  it("build link for class", () => {
    expect(linkForRef(null, q.Ref("classes/a-class")).toJS()).toEqual({
      name: "classes/a-class",
      url: "/db/classes/a-class"
    })

    expect(linkForRef("/db/db1/databases", q.Ref("classes/a-class")).toJS()).toEqual({
      name: "classes/a-class",
      url: "/db/db1/classes/a-class"
    })
  })

  it("build link for index", () => {
    expect(linkForRef(null, q.Ref("indexes/a-index")).toJS()).toEqual({
      name: "indexes/a-index",
      url: "/db/indexes/a-index"
    })

    expect(linkForRef("/db/db1/databases", q.Ref("indexes/a-index")).toJS()).toEqual({
      name: "indexes/a-index",
      url: "/db/db1/indexes/a-index"
    })
  })

  it("returns empty url for non supported refs", () => {
    expect(linkForRef(null, q.Ref("keys/a-key")).toJS()).toEqual({
      name: "keys/a-key",
      url: null
    })
  })
})
