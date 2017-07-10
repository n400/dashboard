import Immutable from "immutable"

import { selectedResource } from "../"

describe("selectedResource", () => {
  describe("when there is a database selected", () => {
    const state = Immutable.fromJS({
      router: {
        database: ["a", "b"]
      }
    })

    const selected = selectedResource(state).toJS()

    it("contains database path", () => expect(selected.database.path).toEqual(["a", "b"]))
    it("contains database url", () => expect(selected.database.url).toEqual("/db/a/b/databases"))
    it("contains database partent path", () => expect(selected.database.parent.path).toEqual(["a"]))
    it("contains database parent url", () => expect(selected.database.parent.url).toEqual("/db/a/databases"))
  })

  describe("when there is NO database selected", () => {
    const state = Immutable.fromJS({
      router: {
        database: []
      }
    })

    const selected = selectedResource(state).toJS()

    it("contains empty database path", () => expect(selected.database.path).toEqual([]))
    it("contains root url", () => expect(selected.database.url).toEqual("/db/databases"))
  })

  describe("when there is a selected class", () => {
    const state = Immutable.fromJS({
      router: {
        database: ["blog"],
        resource: {
          type: "classes",
          name: "posts"
        }
      }
    })

    const selected = selectedResource(state).toJS()

    it("contains class name", () => expect(selected.resource.name).toEqual("posts"))
    it("contains resource type", () => expect(selected.resource.type).toEqual("classes"))
    it("contains class url", () => expect(selected.resource.url).toEqual("/db/blog/classes/posts"))
  })
})
