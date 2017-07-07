import Events from "../events"

it("should be able to fire an event", () => {
  const handled = []

  Events.listen("event1", evt => handled.push(evt.message))
  Events.listen("event2", evt => handled.push(evt.message))
  Events.listen("notFired", evt => handled.push(evt.message))

  return Promise.all([
    Events.fire("event1", { message: "event11" }),
    Events.fire("event1", { message: "event12" }),
    Events.fire("event2", { message: "event2" }),
    Events.fire("no-one-is-listening", { message: "blah" })
  ]).then(() => {
    expect(handled).toEqual(["event11", "event12", "event2"])
  })
})
