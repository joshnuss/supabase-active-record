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

  format(regex, options = {}) {
    return async (object, key) => {
      const value = object[key]

      if (options.allowNull && value === null)
        return

      if (options.allowBlank && typeof(value) === 'string' && value === "")
        return

      if (value && value.match(regex))
        return

      return options.message || 'is invalid'
    }
  },

  type(type, options = {}) {
    return async (object, key) => {
      const value = object[key]

      if (options.allowNull && value === null)
        return

      if (options.allowBlank && !value)
        return

      if (typeof(value) == type)
        return

      return options.message || `must be a ${type}`
    }
  },

  length(length, options = {}) {
    return async (object, key) => {
      const value = object[key]

      if (options.allowNull && value === null)
        return

      if (options.allowBlank && !value)
        return

      if (value && value.length == length)
        return

      return options.message || `length must be ${length}`
    }
  }
}

export default is
