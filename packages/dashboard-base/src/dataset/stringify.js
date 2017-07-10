import { renderSpecialType } from "./special-types"

export const stringify = obj => {
  const replacements = []

  let string = JSON.stringify(obj, (key, value) => {
    const parsed = renderSpecialType(value)

    if (parsed) {
      const placeHolder = "$$dash_replacement_$" + replacements.length + "$$"
      replacements.push(parsed)
      return placeHolder
    }

    return value
  }, 2)

  replacements.forEach((replace, index) => {
    string = string.replace('"$$dash_replacement_$' + index + '$$"', replace)
  })

  return string
}
