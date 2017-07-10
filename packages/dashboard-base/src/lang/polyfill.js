if (!Object.values) {
  Object.values = (obj) =>
    Object
      .keys(obj)
      .map(key => obj[key])
}
