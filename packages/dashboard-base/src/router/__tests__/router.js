import { reduceRouter, updateSelectedResource } from "../"

describe("Given a router store", () => {
  let store, selectedResource

  beforeEach(() => {
    store = createImmutableTestStore({
      router: reduceRouter
    })(state => selectedResource = state.get("router").toJS())
  })

  it("should selected root database", () => {
    store.dispatch(updateSelectedResource({}))
    expect(selectedResource).toEqual({ database: [], resource: null })
  })

  it("should select a sub database", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app/my-blog" }))
    expect(selectedResource).toEqual({ database: ["my-app", "my-blog"], resource: null })
  })

  it("should empty paths", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app///my-blog/" }))
    expect(selectedResource).toEqual({ database: ["my-app", "my-blog"], resource: null })
  })

  it("should select a class", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app/my-blog", className: "people" }))
    expect(selectedResource).toEqual({
      database: ["my-app", "my-blog"],
      resource: {
        type: "classes",
        name: "people"
      }
    })
  })

  it("should select a index", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app/my-blog", indexName: "all_people" }))
    expect(selectedResource).toEqual({
      database: ["my-app", "my-blog"],
      resource: {
        type: "indexes",
        name: "all_people"
      }
    })
  })
})
