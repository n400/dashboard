import Immutable, { Map } from "immutable"
import { query as q } from "faunadb"

import {
  loadSchemaTree,
  loadDatabases,
  createDatabase,
  deleteDatabase,
  createClass,
  deleteClass,
  createIndex,
  deleteIndex,
  reduceSchemaTree
} from "../"

const serverResponseByDatabasePathAndKeyType = Immutable.fromJS({
  "": {
    "admin": { databases: { data: [{ name: "production", ref: q.Ref("databases/production") }] } },
    "server": { classes: { data: [] }, indexes: { data: [] } }
  },
  "production": {
    "admin": {
      databases: {
        data: [
          { name: "site", ref: q.Ref("databases/site") },
          { name: "blog", ref: q.Ref("databases/blog") }
        ]
      }
    },
    "server": { classes: { data: [] }, indexes: { data: [] } }
  },
  "production/site": {
    "admin": { databases: { data: [ { name: "tenants", ref: q.Ref("databases/tenants") } ] } },
    "server": {
      classes: { data: [{ name: "users", ref: q.Ref("classes/users") }] },
      indexes: { data: [{ name: "all_users", ref: q.Ref("indexes/all_users") }] }
    }
  },
  "production/site/tenants": {
    "admin": { databases: { data: [{ name: "user123", ref: q.Ref("databases/user123") }] } },
    "server": { classes: { data: [] }, indexes: { data: [] } }
  },
  "production/site/tenants/user123": {
    "admin": { databases: { data: [] } },
    "server": { classes: { data: [] }, indexes: { data: [] } }
  },
  "production/blog": {
    "admin": { databases: { data: [] } },
    "server": {
      classes: { data: [{ name: "posts", ref: q.Ref("classes/posts") }] },
      indexes: { data: [{ name: "all_posts", ref: q.Ref("indexes/all_posts") }] }
    }
  }
})

const mockFaunaClient = () => {
  const client = {
    query: jest.fn(),
    queryWithPrivilegesOrElse: jest.fn()
  }

  client.queryWithPrivilegesOrElse.mockImplementation((path, keyType, query) => Promise.resolve(
    serverResponseByDatabasePathAndKeyType.getIn([path.join("/"), keyType]).toJS()
  ))

  return client
}

describe("Given a schema tree store", () => {
  let store, schema, client

  beforeEach(() => {
    store = createImmutableTestStore({ schema: reduceSchemaTree })(
      state => schema = state.get("schema").toJS()
    )

    client = mockFaunaClient()
  })

  it("should load schema tree at root database", () => {
    return store.dispatch(loadSchemaTree(client)).then(() => {
      expect(schema).toEqual({
        info: { name: "/", databasesLoaded: true, schemaLoaded: true },
        databases: {
          byName: {
            production: {
              info: { name: "production", ref: q.Ref("databases/production") },
              databases: {},
              classes: {},
              indexes: {}
            },
          },
          cursor: null
        },
        classes: {},
        indexes: {}
      })
    })
  })

  it("should load nested databases", () => {
    return store.dispatch(loadSchemaTree(client, ["production", "site", "tenants"])).then(() => {
      expect(schema).toEqual({
        info: { name: "/" },
        databases: {
          byName: {
            production: {
              info: { name: "production" },
              databases: {
                byName: {
                  site: {
                    info: { name: "site" },
                    databases: {
                      byName: {
                        tenants: {
                          info: { name: "tenants", databasesLoaded: true, schemaLoaded: true },
                          databases: {
                            byName: {
                              user123: {
                                info: { name: "user123", ref: q.Ref("databases/user123") },
                                databases: {}, classes: {}, indexes: {}
                              }
                            },
                            cursor: null
                          },
                          classes: {}, indexes: {}
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
    })
  })

  it("should load the rest of the database tree in background", (done) => {
    store.dispatch(loadSchemaTree(client, ["production", "site", "tenants"], () => {
      expect(schema).toEqual({
        info: { name: "/", databasesLoaded: true },
        databases: {
          byName: {
            production: {
              info: { name: "production", databasesLoaded: true },
              databases: {
                byName: {
                  site: {
                    info: { name: "site", databasesLoaded: true },
                    databases: {
                      byName: {
                        tenants: {
                          info: { name: "tenants", databasesLoaded: true, schemaLoaded: true },
                          databases: {
                            byName: {
                              user123: {
                                info: { name: "user123", ref: q.Ref("databases/user123"), databasesLoaded: true },
                                databases: {}, classes: {}, indexes: {}
                              }
                            },
                            cursor: null
                          },
                          classes: {}, indexes: {}
                        }
                      },
                      cursor: null
                    },
                    classes: {}, indexes: {}
                  },
                  blog: {
                    info: { name: "blog", databasesLoaded: true },
                    databases: {}, classes: {}, indexes: {}
                  }
                },
                cursor: null
              },
              classes: {}, indexes: {}
            }
          },
          cursor: null
        },
        classes: {}, indexes: {}
      })
      done()
    }))
  })

  describe("when the root database is already loaded", () => {
    beforeEach((done) => store.dispatch(loadSchemaTree(client, [], () => {
      client = mockFaunaClient()
      done()
    })))

    it("should not load the same database again", () => {
      return store.dispatch(loadSchemaTree(client, [])).then(() => {
        expect(client.queryWithPrivilegesOrElse).not.toHaveBeenCalled()
      })
    })

    it("should be able to load a sub-database", () => {
      return store.dispatch(loadSchemaTree(client, ["production", "site"])).then(() => {
        expect(schema.databases.byName.production.databases.byName.site).toEqual({
          info: {
            name: "site",
            ref: q.Ref("databases/site"),
            databasesLoaded: true,
            schemaLoaded: true,
          },
          databases: {
            byName: {
              tenants: {
                info: {
                  name: "tenants",
                  ref: q.Ref("databases/tenants")
                },
                databases: {},
                classes: {},
                indexes: {}
              }
            },
            cursor: null
          },
          classes: {
            byName: {
              users: {
                name: "users",
                ref: q.Ref("classes/users")
              }
            },
            cursor: null
          },
          indexes: {
            byName: {
              all_users: {
                name: "all_users",
                ref: q.Ref("indexes/all_users")
              }
            },
            cursor: null
          }
        })
      })
    })


    it("should be able to load more databases based on a cursor", () => {
      client.queryWithPrivilegesOrElse.mockReturnValue(
        Promise.resolve({
          databases: {
            data: [{
              name: "nested"
            }]
          }
        })
      )

      return store.dispatch(loadDatabases(client, ["production"], "cursor")).then(() => {
        expect(schema.databases.byName.production.databases.byName.nested).toEqual({
          info: { name: "nested" },
          databases: {},
          classes: {},
          indexes: {}
        })
      })
    })

    it("should not load databases if already loaded", () => {
      return store.dispatch(loadDatabases(client, [], null)).then(() => {
        expect(client.queryWithPrivilegesOrElse).not.toHaveBeenCalled()
      })
    })

    it("should load nested databases in background", (done) => {
      client.queryWithPrivilegesOrElse.mockReturnValue(
        Promise.resolve({
          databases: {
            data: [{
              name: "nested"
            }]
          }
        })
      )

      store.dispatch(loadDatabases(client, ["production"], "cursor", () => {
        expect(schema.databases.byName.production.databases.byName.nested).toEqual({
          info: { name: "nested", databasesLoaded: true },
          databases: {
            byName: {
              nested: {
                info: { name: "nested" },
                databases: {}, classes: {}, indexes: {}
              }
            },
            cursor: null,
          },
          classes: {}, indexes: {}
        })
        done()
      }))
    })

    it("should load nested databases in background when no cursor", (done) => {
      store.dispatch(loadDatabases(client, ["production"], null, () => {
        expect(schema.databases.byName.production.databases.byName.site).toEqual({
          info: { name: "site", ref: q.Ref("databases/site"), databasesLoaded: true },
          databases: {
            byName: {
              tenants: {
                info: { name: "tenants", ref: q.Ref("databases/tenants") },
                databases: {}, classes: {}, indexes: {}
              }
            },
            cursor: null,
          },
          classes: {}, indexes: {}
        })
        done()
      }))
    })

    it("should be able to create a new database", () => {
      client.query.mockReturnValue(Promise.resolve({ name: "newdb" }))
      return store.dispatch(createDatabase(client, [], { name: "newdb" })).then(() => {
        expect(schema.databases.byName.newdb).toEqual({
          info: { name: "newdb" },
          databases: {},
          classes: {},
          indexes: {}
        })
      })
    })

    it("should be able to delete a database", () => {
      client.query.mockReturnValue(Promise.resolve())
      return store.dispatch(deleteDatabase(client, [], "production")).then(() => {
        expect(schema.databases.byName).toEqual({})
      })
    })

    it("should be able to create a new class", () => {
      client.query.mockReturnValue(Promise.resolve({ name: "newclass" }))
      return store.dispatch(createClass(client, ["production"], { name: "newclass" })).then(() => {
        expect(schema.databases.byName.production.classes.byName.newclass).toEqual({
          name: "newclass"
        })
      })
    })

    it("should be able to delete a class", () => {
      client.query.mockReturnValue(Promise.resolve())
      return store.dispatch(deleteClass(client, ["production", "site"], "users")).then(() => {
        expect(schema.databases.byName.production.databases.byName.site.classes).toEqual({})
      })
    })

    it("should be able to create a new index", () => {
      client.query.mockReturnValue(Promise.resolve({ name: "newindex" }))
      return store.dispatch(createIndex(client, ["production"], { name: "newindex" })).then(() => {
        expect(schema.databases.byName.production.indexes.byName.newindex).toEqual({
          name: "newindex"
        })
      })
    })

    it("should be able to delete an index", () => {
      client.query.mockReturnValue(Promise.resolve())
      return store.dispatch(deleteIndex(client, ["production", "site"], "all_users")).then(() => {
        expect(schema.databases.byName.production.databases.byName.site.indexes).toEqual({})
      })
    })
  })
})
