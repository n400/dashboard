import faunadb, { query as q, errors } from "faunadb"
import { parse as parseURL } from "url"

export default class FaunaClient {
  static KeyType = {
    SERVER: "server",
    ADMIN: "admin"
  }

  // this is bad tech debt, will fix when
  // https://github.com/fauna/core/issues/3546 makes admin keys able to do what server keys can do
  // and https://github.com/fauna/core/issues/3584 allows keys to know what kind they are
  static discoverKeyType(endpoint, secret) {
    const client = new FaunaClient(endpoint, secret, FaunaClient.KeyType.ADMIN)
    const nonce = Math.random().toString(12).slice(2)
    const dbName = `dash_${nonce}_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete`
    const className = `dash_${nonce}_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete`

    return client
      .query([], FaunaClient.KeyType.ADMIN, q.CreateDatabase({ name: dbName }))
      .then(
        () => {
          // we are an admin key, lets fix our mess
          return client
            .query([], FaunaClient.KeyType.ADMIN, q.Delete(q.Ref(`databases/${dbName}`)))
            .then(() => client)
        },
        error => {
          if (error instanceof errors.PermissionDenied) {
            return client
              .query([], FaunaClient.KeyType.SERVER, q.CreateClass({ name: className }))
              .then(
                () => {
                  // we are a server key, lets fix our mess
                  return client
                    .query([], FaunaClient.KeyType.SERVER, q.Delete(q.Ref(`classes/${className}`)))
                    .then(() => new FaunaClient(endpoint, secret, FaunaClient.KeyType.SERVER))
                },
                error => {
                  return client
                    .query([], FaunaClient.KeyType.SERVER, q.Delete(q.Ref(`classes/${className}`)))
                    .then(
                      () => { throw error },
                      () => { throw error }
                    )
                }
              )
          } else {
            // delete the test db in case we are out of sync
            return client
              .query([], FaunaClient.KeyType.ADMIN, q.Delete(q.Ref(`databases/${dbName}`)))
              .then(
                () => { throw error },
                () => { throw error }
              )
          }
        })
  }

  constructor(endpoint, secret, keyType) {
    const config = {}

    if (endpoint) {
      const endpointURL = parseURL(endpoint)
      config.domain = endpointURL.hostname
      config.scheme = endpointURL.protocol.replace(/:$/,'')

      if (endpointURL.port) {
        config.port = endpointURL.port
      }
    }

    this.endpoint = endpoint
    this.secret = secret
    this.config = config
    this.keyType = keyType

    this.availablePrivileges = Object.values(FaunaClient.KeyType)
      .filter(type => this.hasPrivileges(type))
  }

  query(dbPath, keyType, expr) {
    if (!this.hasPrivileges(keyType))  {
      return Promise.reject(
        new Error(`Your key does not have ${keyType} privileges. Current key is a ${this.keyType} key`)
      )
    }

    const config = { ...this.config, secret: this.__secretForSubDB(dbPath, keyType) }
    return new faunadb.Client(config).query(expr)
  }

  queryWithPrivilegesOrElse(dbPath, keyType, orElse, expr) {
    if (this.hasPrivileges(keyType))
      return this.query(dbPath, keyType, expr)

    return Promise.resolve(orElse)
  }

  hasPrivileges(keyType) {
    return this.keyType === FaunaClient.KeyType.ADMIN || keyType === this.keyType
  }

  __secretForSubDB(dbPath, keyType) {
    const dbName = dbPath.join("/")
    if (!dbName) return this.secret

    const parts = this.secret.split(":")
    const secret = parts.shift()
    const path = parts.length === 2 ? `${parts[0]}/${dbName}` : dbName

    return `${secret}:${path}:${keyType}`
  }
}

export const KeyType = FaunaClient.KeyType
