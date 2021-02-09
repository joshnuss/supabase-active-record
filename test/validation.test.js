import { ActiveRecord, is } from '../'

test('valid', async () => {
  class Product extends ActiveRecord {
    static config = {
      fields: {
        name: 'string'
      }
    }
  }

  const product = new Product({firstName: "Josh"})
  const result = await product.validate()

  expect(result).toEqual({
    valid: true,
    errors: {}
  })
})

describe('validates required', () => {
  class Person extends ActiveRecord {
    static config = {
      fields: {
        firstName: 'string',
        lastName: 'string',
        occupation: 'string'
      },
      validate: {
        firstName: is.required(),
        lastName: is.required({allowNull: true}),
        occupation: is.required({allowBlank: true})
      }
    }
  }

  test('null fails validation', async () => {
    const person = new Person()
    const result = await person.validate()

    expect(result).toEqual({
      valid: false,
      errors: {
        firstName: ['is required'],
        occupation: ['is required']
      }
    })
  })

  test('null is ok when when allowed', async () => {
    const person = new Person({firstName: "Josh", occupation: "Developer"})
    const result = await person.validate()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
  })

  test('blank string is ok when when allowed', async () => {
    const person = new Person({firstName: "Josh", occupation: ""})
    const result = await person.validate()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
  })

  test('custom error message', async () => {
    class Product extends ActiveRecord {
      static config = {
        fields: {
          name: 'string'
        },
        validate: {
          name: is.required({message: "where's the name??"})
        }
      }
    }

    const product = new Product()
    const result = await product.validate()

    expect(result).toEqual({
      valid: false,
      errors: {
        name: ["where's the name??"]
      }
    })
  })
})

describe('validates numeric', () => {
  class Person extends ActiveRecord {
    static config = {
      fields: {
        age: 'number',
        netWorth: 'number',
      },
      validate: {
        age: is.numeric(),
        netWorth: is.numeric({allowNull: true}),
        parkingTickets: is.numeric({allowZero: true})
      }
    }
  }

  test('null fails validation', async () => {
    const person = new Person()
    const result = await person.validate()

    expect(result).toEqual({
      valid: false,
      errors: {
        age: ['must be numeric'],
        parkingTickets: ['must be numeric'],
      }
    })
  })

  test('null is ok when when allowed', async () => {
    const person = new Person({age: 39, parkingTickets: 1})
    const result = await person.validate()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
  })

  test('zero is ok when when allowed', async () => {
    const person = new Person({age: 39, parkingTickets: 0})
    const result = await person.validate()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
  })

  test('custom error message', async () => {
    class Person extends ActiveRecord {
      static config = {
        fields: {
          age: 'number'
        },
        validate: {
          age: is.numeric({message: "huh?"})
        }
      }
    }

    const product = new Person()
    const result = await product.validate()

    expect(result).toEqual({
      valid: false,
      errors: {
        age: ["huh?"]
      }
    })
  })
})

describe('custom validation', () => {
  class Person extends ActiveRecord {
    static config = {
      fields: {
        favoriteColor: 'string'
      },
      validate: {
        favoriteColor: (object, key) => {
          if (object[key] == 'red')
            return

          return 'must be red'
        }
      }
    }
  }

  test('valid when return no error', async () => {
    const person = new Person({favoriteColor: 'red'})
    const result = await person.validate()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
  })

  test('invalid when function returns error', async () => {
    const person = new Person({favoriteColor: 'blue'})
    const result = await person.validate()

    expect(result).toEqual({
      valid: false,
      errors: {
        favoriteColor: ['must be red']
      }
    })
  })
})
