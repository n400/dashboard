const listeners = {}
const addListener = (name, callback) => listeners[name] = (listeners[name] || []).concat(callback)

const fireEvent = (name, data) => {
  const callbacks = listeners[name] || []
  const promises = callbacks.map(callback => new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        callback(data)
        resolve()
      } catch (err) {
        reject(err)
      }
    }, 0)
  }))

  return Promise.all(promises)
}

export default {
  listen: addListener,
  fire: fireEvent
}
