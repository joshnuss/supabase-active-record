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
  },

  numeric(options = {}) {
    return async (object, key) => {
      const value = object[key]

      if (options.allowNull && value === null)
        return

      if (options.allowZero && typeof(value) === 'number' && value === 0)
        return

      if (typeof(value) == 'number')
        return

      return options.message || 'must be numeric'
    }
  }
}

export default is
