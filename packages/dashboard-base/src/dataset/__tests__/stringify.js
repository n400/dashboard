import { query as q } from "faunadb"

import { stringify } from "../stringify"

it("replaces special types", () => {
  expect(stringify({
    ref: q.Ref("classes/people/42"),
    name: "Bob"
  })).toEqual(
    '{\n  "ref": q.Ref("classes/people/42"),\n  "name": "Bob"\n}'
  )
})
