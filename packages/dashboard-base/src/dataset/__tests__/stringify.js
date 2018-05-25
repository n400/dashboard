import { query as q } from "faunadb"

import { stringify } from "../stringify"

it("replaces special types", () => {
  const peopleClass = { id: "people", class: { "@ref": { id: "classes" } } }
  expect(stringify({
    ref: { "@ref": { id: "42", class: peopleClass } },
    name: "Bob"
  })).toEqual(
    '{\n  "ref": q.Ref(q.Class("people"), "42"),\n  "name": "Bob"\n}'
  )
})
