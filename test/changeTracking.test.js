import { jest } from '@jest/globals'
import { ActiveRecord } from '../'

class Product extends ActiveRecord {
  static config = {
    table: 'products',
    fields: {
      id: 'serial',
      name: 'string',
      price: 'number'
    }
  }
}

describe('dirty tracking', () => {
  let client

  beforeEach(() => {
    client = {
      from: jest.fn(() => client),
      match: jest.fn(() => client),
      update: jest.fn(() => client),
    }
    ActiveRecord.client = client
  })

  test('starts as clean', () => {
    const product = new Product()

    expect(product.isChanged).toBe(true)
    expect(product.isPersisted).toBe(false)
  })

  test('marked dirty when attribute changed', () => {
    const product = new Product({}, {hydrating: true})

    product.name = "T-Shirt"

    expect(product.isChanged).toBe(true)
    expect(product.isPersisted).toBe(false)
  })

  test('marked clean when saved', async () => {
    const product = new Product({name: "Pants"}, {hydrating: true})

    product.name = "T-Shirt"
    await product.save()

    expect(product.isChanged).toBe(false)
    expect(product.isPersisted).toBe(true)
  })
})
