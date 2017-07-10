import { evalQuery } from "../"

const fakeEval = code => {
  let res; evalQuery((parsed) => res = parsed)(code)
  return res
}

it("evals literals", () => {
  expect(fakeEval("42.2")).toEqual(42.2)
  expect(fakeEval("'a string'")).toEqual("a string")
  expect(fakeEval("false")).toEqual(false)
  expect(fakeEval("[1, 2, 3]")).toEqual([1, 2, 3])
  expect(fakeEval("{ a: 1, b: 2 }")).toEqual({ a: 1, b: 2 })
})

it("evals code blocks", () => {
  expect(fakeEval("var x = 1; x + 2")).toEqual(3)
})

it("evals multiple lines of code blocks", () => {
  expect(fakeEval("var x = 1\nx + 2")).toEqual(3)
})

it("evals multiple lines of literal object", () => {
  expect(fakeEval("{\n a: 1,\n b: 2\n }")).toEqual({ a: 1, b: 2 })
})

it("returns a rejected promise", () =>
  evalQuery(() => null)("invalidVar").catch(err =>
    expect(err).toEqual(new ReferenceError("invalidVar is not defined"))
  )
)
