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
    delete: jest.fn(() => client),
  }
  ActiveRecord.client = client
})

describe('deleting', () => {
  test('when valid', async () => {
    client.match.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })

    const product = new Product({id: 1, name: "T-Shirt", price: 99}, {hydrating: true})

    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
    expect(product.isNewRecord).toBe(false)

    await product.delete()

    expect(client.from).toBeCalledWith('products')
    expect(client.match).toBeCalledWith({id: 1})
    expect(client.delete).toBeCalled()
    expect(product.id).toBe(1)
    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
  })

  test('when invalid', async () => {
    const product = new Product({id: 2, name: "Foo"}, {hydrating: true})
    product.name = null

    await product.delete()

    expect(client.from).toBeCalledWith('products')
    expect(client.match).toBeCalledWith({id: 2})
    expect(client.delete).toBeCalled()
    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
  })
})
