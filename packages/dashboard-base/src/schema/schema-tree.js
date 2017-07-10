import Immutable, { Map, List } from "immutable"
import { query as q } from "faunadb"

import { KeyType } from "../persistence/faunadb-wrapper"
import { nestedDatabaseNodeIn, allDatabasesPaths } from "./path"

const Actions = {
  LOAD_SCHEMA: "@@schema/LOAD_SCHEMA",
  LOAD_DATABASE_TREE: "@@schema/LOAD_DATABASE_TREE",
  LOAD_NESTED_DATABASES: "@@schema/LOAD_NESTED_DATABASES",
  UPDATE: "@@schema/UPDATE",
  DELETE: "@@schema/DELETE"
}

const toPage = (result, mapper = x => Immutable.fromJS(x)) => {
  if (!result || !result.data || result.data.length === 0)
    return Map()

  return Map({
    cursor: result.after || null,
    byName: List(result.data).reduce(
      (acc, elem) => acc.set(elem.name, mapper(elem)),
      Map()
    )
  })
}

const toDatabase = (info, result = {}) => {
  return Map({
    info: Map(info),
    databases: toPage(result.databases, toDatabase),
    classes: toPage(result.classes),
    indexes: toPage(result.indexes)
  })
}

const toDatabaseWith = (...info) => res =>
  toDatabase(Map.of.apply(null, info), res)

const getInstancesOf = (resource, cursor) => q.Map(
  // If cursor is null, remove it from the query
  q.Paginate(q.Ref(resource), { after: cursor || undefined }),
  ref => q.Get(ref)
)

const queryForSubDatabases = (client, dbPath, dbCursor = null) => {
  return client.queryWithPrivilegesOrElse(dbPath, KeyType.ADMIN,
    { databases: { data: [] } },
    { databases: getInstancesOf("databases", dbCursor) }
  )
}

const nonEmptyCursors = cursors => {
  const query = {}

  for (let key in cursors)
    if (cursors[key] !== undefined)
      query[key] = getInstancesOf(key, cursors[key])

  return query
}

const paginateAll = (client, dbPath, keyType, cursors, results = {}) => {
  const query = nonEmptyCursors(cursors)

  if (Object.keys(query).length === 0)
    return null

  return client
    .queryWithPrivilegesOrElse(dbPath, keyType, {}, query)
    .then(response => {
      const nextCursors = {}

      for (let key in response) {
        if (!response.hasOwnProperty(key))
          continue

        const data = (results[key] && results[key].data) || []
        results[key] = { data: data.concat(response[key].data) }
        nextCursors[key] = response[key].after
      }

      return paginateAll(
        client, dbPath, keyType, nextCursors, results) || results
    })
}

const queryForDatabaseResources = (client, dbPath) =>
  paginateAll(client, dbPath, KeyType.SERVER, {
    classes: null,
    indexes: null
  })


const queryForSchema = (client, dbPath) => {
  return Promise.all([
    queryForSubDatabases(client, dbPath),
    queryForDatabaseResources(client, dbPath)
  ]).then(
    results => ({
      ...results[0],
      ...results[1]
    })
  )
}

const nop = () => {}
const schema = state => state.get("schema")

const databaseFlaggedOrElse = (schema, path, flag, elseFn) => {
  const nodePath = nestedDatabaseNodeIn(path)
  const node = schema.getIn(nodePath, Map())

  if (node.getIn(["info", flag], false))
    return Promise.resolve(node)

  return elseFn(node, nodePath)
}

const groupDatabasesByName = databases =>
  List(databases)
    .groupBy(db => db.getIn(["info", "name"]))
    .map(each => each.first())

const fetchNestedDatabases = (client, path, databases = []) => (dispatch, getState) => {
  const dbPath = List(path)

  return Promise.all(
    databases.map(db => {
      const nestedPath = dbPath.push(db.name)
      return databaseFlaggedOrElse(schema(getState()), nestedPath, "databasesLoaded", () =>
        queryForSubDatabases(client, nestedPath).then(
          toDatabaseWith("name", db.name, "databasesLoaded", true))
      )
    })
  ).then(nodes =>
    dispatch({
      type: Actions.LOAD_NESTED_DATABASES,
      dbPath: dbPath,
      nodePath: nestedDatabaseNodeIn(path, ["databases", "byName"]),
      node: groupDatabasesByName(nodes)
    })
  )
}

const fetchDatabaseTree = (client, path) => (dispatch, getState) => {
  const parentTree = allDatabasesPaths(path).butLast().reverse()
    .map(path =>
      databaseFlaggedOrElse(schema(getState()), path, "databasesLoaded", () =>
        queryForSubDatabases(client, path).then(result =>
          Promise.all(
            result.databases.data.map(db =>
              queryForSubDatabases(client, path.push(db.name)).then(
                toDatabaseWith("name", db.name, "databasesLoaded", true)
              )
            )
          ).then(subDatabases =>
            toDatabase(Map.of("name", path.last() || "/", "databasesLoaded", true), result)
              .setIn(["databases", "byName"], groupDatabasesByName(subDatabases))
          )
        )
      )
    )
    .reduce((last, prev) =>
      last.then(lst =>
        prev.then(prv =>
          prv.setIn(["databases", "byName", lst.getIn(["info", "name"])], lst)
        )
      )
    )

  if (!parentTree)
    return Promise.resolve()

  return parentTree.then(database => {
    dispatch({
      type: Actions.LOAD_DATABASE_TREE,
      nodePath: List(),
      dbPath: List(),
      node: database,
    })
  })
}

const databasesNotLoaded = database =>
  database
    .getIn(["databases", "byName"], Map()).toList()
    .filterNot(db => db.getIn(["info", "databasesLoaded"]))
    .map(db => ({ name: db.getIn(["info", "name"]) }))

export const loadDatabases = (client, dbPath, cursor = null, onCompleteAsyncOperations = nop) => (dispatch, getState) => {
  const nodePath = nestedDatabaseNodeIn(dbPath)
  const dbNode = schema(getState()).getIn(nodePath)

  if (cursor === null) {
    dispatch(fetchNestedDatabases(client, dbPath, databasesNotLoaded(dbNode)))
      .then(onCompleteAsyncOperations)

    return Promise.resolve()
  }

  return queryForSubDatabases(client, dbPath, cursor).then(result => {
    dispatch(fetchNestedDatabases(client, dbPath, result.databases.data))
      .then(onCompleteAsyncOperations)

    dispatch({
      type: Actions.LOAD_NESTED_DATABASES,
      dbPath: List(dbPath),
      node: toDatabase(dbNode.get("info").set("databasesLoaded", true), result),
      nodePath
    })
  })
}

export const loadSchemaTree = (client, path = [], onCompleteAsyncOperations = nop) => (dispatch, getState) =>
  databaseFlaggedOrElse(schema(getState()), path, "schemaLoaded", (dbNode, nodePath) => {
    const info = dbNode
      .get("info", Map.of("name", nodePath.last() || "/"))
      .set("schemaLoaded", true)
      .set("databasesLoaded", true)

    return queryForSchema(client, path).then(result => {
      Promise.all([
        dispatch(fetchDatabaseTree(client, path)),
        dispatch(fetchNestedDatabases(client, path, result.databases.data))
      ]).then(
        onCompleteAsyncOperations
      )

      dispatch({
        type: Actions.LOAD_SCHEMA,
        node: toDatabase(info, result),
        dbPath: List(path),
        nodePath
      })
    })
  })

const create = (nodeToUpdate, keyType, createQuery, mapper = x => x) => (client, dbPath, config) => (dispatch) => {
  return client.query(dbPath, keyType, createQuery(config)).then(
    instance => {
      dispatch({
        type: Actions.UPDATE,
        path: nestedDatabaseNodeIn(dbPath, [nodeToUpdate, "byName", instance.name]),
        data: mapper(instance)
      })
      return instance
    }
  )
}

export const createDatabase = create("databases", KeyType.ADMIN, q.CreateDatabase, toDatabase)
export const createClass = create("classes", KeyType.SERVER, q.CreateClass)
export const createIndex = create("indexes", KeyType.SERVER, q.CreateIndex)

const remove = (nodeToUpdate, keyType, refConstructor) => (client, path, name) => (dispatch) => {
  return client.query(path, keyType, q.Delete(refConstructor(name))).then(
    () => dispatch({
      type: Actions.DELETE,
      nodePath: nestedDatabaseNodeIn(path, [nodeToUpdate, "byName", name])
    })
  )
}

export const deleteDatabase = remove("databases", KeyType.ADMIN, q.Database)
export const deleteClass = remove("classes", KeyType.SERVER, q.Class)
export const deleteIndex = remove("indexes", KeyType.SERVER, q.Index)

const ensureTreeInfo = (schema, path) => allDatabasesPaths(path).reduce(
  (tree, path) => {
    const infoPath = nestedDatabaseNodeIn(path, "info")
    if (tree.hasIn(infoPath)) return tree
    return tree.setIn(infoPath, Map.of("name", path.last()))
  },
  schema
)

export const reduceSchemaTree = (state = Map.of("info", Map.of("name", "/")), action) => {
  switch (action.type) {
    case Actions.LOAD_SCHEMA:
    case Actions.LOAD_DATABASE_TREE:
    case Actions.LOAD_NESTED_DATABASES:
      return ensureTreeInfo(state, action.dbPath)
        .mergeDeepIn(action.nodePath, action.node)

    case Actions.UPDATE:
      return state.mergeDeepIn(action.path, action.data)

    case Actions.DELETE:
      return state.deleteIn(action.nodePath)

    default:
      return state
  }
}
