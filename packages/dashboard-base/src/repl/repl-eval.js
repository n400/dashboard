import { query as q } from "faunadb"

/* eslint-disable */
const doEval = (q, code) =>
  code.match(/^\s*{(.*\n*)*}\s*$/)
    ? eval(`(${code})`)
    : eval(code)


export const evalQuery = (executeQuery) => (code) => {
  if (!code.trim()) {
    return Promise.reject("Can not eval empty query.")
  }

  try {
    return executeQuery(doEval(q, code))
  } catch (error) {
    return Promise.reject(error)
  }
}
