import { jest } from '@jest/globals'
import { ActiveRecord, is } from '../'

class Product extends ActiveRecord {
  static config = {
    table: "products",
    fields: {
      name: 'string',
      price: 'number'
    },
    validate: {
      name: is.required()
    }
  }
}

let client

beforeEach(() => {
  client = {
    from: jest.fn(() => client),
    insert: jest.fn(() => client),
  }
  ActiveRecord.client = client
})

describe('creating with save', () => {
  test('when valid', async () => {
    client.insert.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })

    const product = new Product({name: "T-Shirt", price: 99})

    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
    expect(product.isNewRecord).toBe(true)

    const result = await product.save()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
    expect(client.from).toBeCalledWith('products')
    expect(client.insert).toBeCalledWith({name: "T-Shirt", price: 99})
    expect(product.id).toBe(1)
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
  })

  test('when invalid', async () => {
    const product = new Product()
    const result = await product.save()

    expect(result).toEqual({
      valid: false,
      errors: {
        name: [ 'is required' ]
      }
    })
    expect(client.insert).not.toBeCalled()
    expect(product.isNewRecord).toBe(true)
    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
  })
})

describe('creating with factory', () => {
  test('when valid', async () => {
    client.insert.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })

    const { valid, record: product, errors } = await Product.create({
      name: "T-Shirt",
      price: 99
    })

    expect(valid).toBe(true)
    expect(errors).toEqual({})
    expect(product).not.toBe(null)
    expect(product.id).toBe(1)
    expect(client.from).toBeCalledWith('products')
    expect(client.insert).toBeCalledWith({name: "T-Shirt", price: 99})
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
  })

  test('when invalid', async () => {
    const {valid, errors, record: product} = await Product.create()

    expect(valid).toBe(false)
    expect(errors).toEqual({
      name: [ 'is required' ]
    })
    expect(product).not.toBe(null)
    expect(client.insert).not.toBeCalled()
    expect(product.isNewRecord).toBe(true)
    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
  })
})

test('create multiple', async () => {
  client.insert.mockResolvedValue({
    data: [
      {id: 1, name: "T-shirt"},
      {id: 2, name: "Pants"}
    ]
  })

  const products = await Product.create([
    {name: "T-shirt"},
    {name: "Pants"}
  ])

  expect(products.length).toBe(2)
  expect(products[0].id).toBe(1)
  expect(products[0].name).toBe('T-shirt')
  expect(products[0].isDirty).toBe(false)
  expect(products[0].isNewRecord).toBe(false)
  expect(products[1].id).toBe(2)
  expect(products[1].name).toBe('Pants')
  expect(products[0].isDirty).toBe(false)
  expect(products[0].isNewRecord).toBe(false)
})
