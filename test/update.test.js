import { jest } from '@jest/globals'
import { ActiveRecord, is } from '../'

class Product extends ActiveRecord {
  static config = {
    table: "products",
    fields: {
      id: 'serial',
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
    match: jest.fn(() => client),
    update: jest.fn(() => client),
    eq: jest.fn(() => client),
  }
  ActiveRecord.client = client
})

describe('updating', () => {
  test('when valid', async () => {
    client.match.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })

    const product = new Product({id: 1, name: "T-Shirt", price: 99}, {hydrating: true})

    expect(product.isPersisted).toBe(true)
    expect(product.isChanged).toBe(false)
    expect(product.isNewRecord).toBe(false)

    const result = await product.save()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
    expect(client.from).toBeCalledWith('products')
    expect(client.match).toBeCalledWith({id: 1})
    expect(client.update).toBeCalledWith({name: "T-Shirt", price: 99})
    expect(product.id).toBe(1)
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(true)
    expect(product.isChanged).toBe(false)
  })

  test('when invalid', async () => {
    const product = new Product({id: 2, name: "Foo"}, {hydrating: true})
    product.name = null

    const result = await product.save()

    expect(result).toEqual({
      valid: false,
      errors: {
        name: [ 'is required' ]
      }
    })
    expect(client.update).not.toBeCalled()
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(false)
    expect(product.isChanged).toBe(true)
  })

  test('in bulk', async () => {
    client.update.mockResolvedValue({
      data: []
    })

    await Product
      .where({price: 20})
      .update({price: 10, label: "on-sale"})

    expect(client.from).toBeCalledWith('products')
    expect(client.eq).toBeCalledWith('price', 20)
    expect(client.update).toBeCalledWith({price: 10, label: "on-sale"})
  })
})
