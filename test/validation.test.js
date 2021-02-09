import { ActiveRecord, is } from '../'

class Product extends ActiveRecord {
  static config = {
    fields: {
      name: 'string'
    }
  }
}

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

test('valid', async () => {
  const product = new Product({firstName: "Josh"})
  const result = await product.validate()

  expect(result).toEqual({
    valid: true,
    errors: {}
  })
})

describe('validates required', () => {
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
})
