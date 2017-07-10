const withSessionStorage = (fn) => {
  const storage = window.sessionStorage
  if (!storage) return undefined

  try {
    return fn(storage)
  } catch (err) {
    return undefined
  }
}

export default {
  set(key, value) {
    withSessionStorage(storage => {
      const json = JSON.stringify(value)
      storage.setItem(key, json)
    })
  },

  get(key) {
    return withSessionStorage(storage => {
      return JSON.parse(storage.getItem(key))
    })
  },

  clear() {
    withSessionStorage(storage => storage.clear())
  }
}
