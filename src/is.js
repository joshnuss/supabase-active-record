const is = {
  required(options = {}) {
    return async (object, key) => {
      const value = object[key]

      if (options.allowNull && value === null)
        return

      if (options.allowBlank && typeof(value) === 'string' && value === "")
        return

      if (value !== null)
        return

      return options.message || 'is required'
    }
  }
}

export default is
