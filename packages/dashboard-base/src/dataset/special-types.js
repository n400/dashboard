import { values as v } from "faunadb"

export const renderSpecialType = (type) => {
  if (!type) return null

  if (type instanceof v.Value) {
    if (type instanceof v.Ref) return `q.Ref("${type.value}")`
    if (type instanceof v.FaunaTime) return `q.Time("${type.value}")`
    if (type instanceof v.FaunaDate) return `q.Date("${type.value}")`
    return null
  }

  if (typeof type === "object" && !Array.isArray(type)) {
    const keys = Object.keys(type)

    switch (keys[0]) {
      case "@ref":  return renderSpecialType(new v.Ref(type["@ref"]))
      case "@ts":   return renderSpecialType(new v.FaunaTime(type["@ts"]))
      case "@date": return renderSpecialType(new v.FaunaDate(type["@date"]))
      default:      return null
    }
  }

  return null
}
