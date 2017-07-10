import Immutable from "immutable"
import { query as q } from "faunadb"

import {
  selectedDatabase,
  selectedClass,
  selectedIndex,
  databaseTree
} from "../"

const schemaTree = Immutable.fromJS({
  info: {
    name: "/"
  },
  databases: {
    cursor: "fake cursor",
    byName: {
      "my-app": {
        info: {
          name: "my-app",
          ref: q.Ref("databases/my-app")
        },
        databases: {
          byName: {
            "my-blog": {
              info: {
                name: "my-blog"
              },
              classes: {
                byName: {
                  "people": {
                    name: "people",
                    ref: q.Ref("classes/people"),
                    history_days: 10,
                    ttl_days: 1
                  },
                  "users": {
                    name: "users",
                    ref: q.Ref("classes/users")
                  }
                }
              },
              indexes: {
                byName: {
                  "all_people": {
                    name: "all_people",
                    source: q.Ref("classes/people"),
                    ref: q.Ref("indexes/all_people")
                  },
                  "all_users": {
                    name: "all_users",
                    source: q.Ref("classes/users"),
                    ref: q.Ref("indexes/all_users")
                  },
                  "people_by_name": {
                    ref: q.Ref("indexes/people_by_name"),
                    name: "people_by_name",
                    source: q.Ref("classes/people"),
                    unique: false,
                    active: true,
                    partitions: 8,
                    values: [
                      { field: [ "data", "name" ], transform: "casefold" },
                      { field: [ "ref" ] },
                    ],
                    terms: [
                      { field: [ "data", "name" ], transform: "casefold" }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})

describe("selectedDatabase", () => {
  describe("when there is a database selected", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"]
      }
    })

    const database = selectedDatabase(state).toJS()

    it("contains database path", () => expect(database.path).toEqual(["my-app", "my-blog"]))
    it("contains database url", () => expect(database.url).toEqual("/db/my-app/my-blog/databases"))
    it("contains database name", () => expect(database.name).toEqual("my-blog"))
    it("contains database parent path", () => expect(database.parent.path).toEqual(["my-app"]))
    it("contains database parent url", () => expect(database.parent.url).toEqual("/db/my-app/databases"))
    it("contains database sub-databases", () => expect(database.databases).toEqual([]))
    it("should idefity root database", () => expect(database.isRoot).toBeFalsy())

    it("contains database classes", () => {
      expect(database.classes).toEqual([
        { name: "people", ref: q.Ref("classes/people"), url: "/db/my-app/my-blog/classes/people" },
        { name: "users", ref: q.Ref("classes/users"), url: "/db/my-app/my-blog/classes/users" }
      ])
    })

    it("contains database indexes", () => {
      expect(database.indexes).toEqual([
        { name: "all_people", ref: q.Ref("indexes/all_people"), url: "/db/my-app/my-blog/indexes/all_people" },
        { name: "all_users", ref: q.Ref("indexes/all_users"), url: "/db/my-app/my-blog/indexes/all_users" },
        { name: "people_by_name", ref: q.Ref("indexes/people_by_name"), url: "/db/my-app/my-blog/indexes/people_by_name" }
      ])
    })
  })

  describe("when there is NO database selected", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: []
      }
    })

    const database = selectedDatabase(state).toJS()

    it("contains emtpy database path", () => expect(database.path).toEqual([]))
    it("contains root url", () => expect(database.url).toEqual("/db/databases"))
    it("contains root db name", () => expect(database.name).toEqual("/"))
    it("contains no classes", () => expect(database.classes).toEqual([]))
    it("contains no indexes", () =>  expect(database.indexes).toEqual([]))
    it("should idefity root database", () => expect(database.isRoot).toBeTruthy())

    it("contains database sub-databases", () => {
      expect(database.databases).toEqual([
        { name: "my-app", ref: q.Ref("databases/my-app"), url: "/db/my-app/databases" }
      ])
    })
  })
})

describe("selectedClass", () => {
  it("returns the selected class", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"],
        resource: {
          type: "classes",
          name: "people"
        }
      }
    })

    expect(selectedClass(state).toJS()).toEqual({
      name: "people",
      historyDays: 10,
      ttlDays: 1,
      ref: q.Ref("classes/people"),
      indexes: [
        {
          name: "all_people",
          ref: q.Ref("indexes/all_people"),
          url: "/db/my-app/my-blog/indexes/all_people",
          terms: [],
          values: []
        },
        {
          name: "people_by_name",
          ref: q.Ref("indexes/people_by_name"),
          url: "/db/my-app/my-blog/indexes/people_by_name",
          terms: [{ field: ["data", "name"], transform: "casefold" }],
          values: [{ field: ["data", "name"], transform: "casefold" }, { field: ["ref"] }],
        }
      ]
    })
  })
})

describe("selectedIndex", () => {
  it("returns the selected index", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"],
        resource: {
          type: "indexes",
          name: "people_by_name"
        }
      }
    })

    expect(selectedIndex(state).toJS()).toEqual({
      name: "people_by_name",
      ref: q.Ref("indexes/people_by_name"),
      active: true,
      unique: false,
      partitions: 8,
      source: {
        name: "classes/people",
        url: "/db/my-app/my-blog/classes/people"
      },
      values: [
        { field: "data.name", transform: "casefold" },
        { field: "ref", transform: null }
      ],
      terms: [
        { field: "data.name", transform: "casefold" }
      ]
    })
  })
})

describe("databaseTree", () => {
  it("returns the database tree", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: []
      }
    })

    expect(databaseTree(state).toJS()).toEqual({
      url: "/db/databases",
      name: "/",
      path: [],
      hasMore: true,
      cursor: "fake cursor",
      databases: [
        {
          url: "/db/my-app/databases",
          name: "my-app",
          path: ["my-app"],
          hasMore: false,
          cursor: null,
          databases: [
            {
              url: "/db/my-app/my-blog/databases",
              name: "my-blog",
              path: ["my-app", "my-blog"],
              hasMore: false,
              cursor: null,
              databases: []
            }
          ]
        }
      ]
    })
  })
})
