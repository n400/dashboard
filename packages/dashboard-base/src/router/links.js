import { Map, List } from "immutable"

const ROOT_URL = "/db"
const ROOT_RESOURCE_URL = `${ROOT_URL}/databases`

export const buildResourceUrl = (parentUrl, path, resource) => {
  const parent = decodeURI(parentUrl || ROOT_RESOURCE_URL)
  const url = List(parent.split("/").slice(2).slice(0, -1))
    .concat(path)
    .concat(resource)
    .join("/")

  return encodeURI(
    `${ROOT_URL}/${url}`
       .replace(/\/\/+/, "/")
       .replace(/\/$/, "")
  )
}

const supportedRefTypes = [
  "classes",
  "indexes"
]

const refToPath = (ref) => {
  var path = []
  if (ref && ref.class) path.push(refToPath(ref.class))
  if (ref) path.push(ref.id)
  return path.join("/")
}

export const linkForRef = (parentUrl, ref) => {
  const path = refToPath(ref)
  const type = (ref && ref.class && ref.class.id) || ""

  if (!supportedRefTypes.includes(type))
    return Map.of("name", path, "url", null)

  return Map.of(
    "name", path,
    "url", buildResourceUrl(parentUrl, path)
  )
}
