import { jest } from '@jest/globals'
import { ActiveRecord } from '../'

class Product extends ActiveRecord {
  static config = {
    table: "products",
    fields: {
      id: 'serial',
      name: 'string'
    }
  }
  static expensive() {
    return this.where('price', '>', 10000)
  }
}

let client

beforeEach(() => {
  client = {
    from: jest.fn(() => client),
    single: jest.fn(() => client),
    limit: jest.fn(() => client),
    order: jest.fn(() => client),
    select: jest.fn(),
    eq: jest.fn(() => client),
    neq: jest.fn(() => client),
    gt: jest.fn(() => client),
  }
  ActiveRecord.client = client
})

test('all', async () => {
  client.select.mockResolvedValue({
    data: [
      {id: 1, name: "T-Shirt"},
      {id: 2, name: "Pants"}
    ]
  })

  const products = await Product.all()

  expect(client.from).toHaveBeenCalledWith("products")
  expect(client.select).toHaveBeenCalledWith("id, name")
  expect(products.length).toBe(2)

  let product = products[0]

  expect(product.id).toEqual(1)
  expect(product.name).toEqual('T-Shirt')
  expect(product.isPersisted).toBe(true)
  expect(product.isChanged).toBe(false)
  expect(product.isNewRecord).toBe(false)
  expect(product.constructor).toEqual(Product)

  product = products[1]

  expect(product.id).toEqual(2)
  expect(product.name).toEqual('Pants')
  expect(product.isPersisted).toBe(true)
  expect(product.isChanged).toBe(false)
  expect(product.isNewRecord).toBe(false)
  expect(product.constructor).toEqual(Product)
})

test('findBy', async () => {
  client.select.mockResolvedValue({
    data: {id: 1, name: "T-Shirt"}
  })

  const product = await Product.findBy({id: 1, name: "T-Shirt"})

  expect(client.from).toHaveBeenCalledWith("products")
  expect(client.single).toHaveBeenCalled()
  expect(client.select).toHaveBeenCalledWith("id, name")
  expect(client.eq).toHaveBeenCalledWith("id", 1)
  expect(client.eq).toHaveBeenCalledWith("name", "T-Shirt")

  expect(product).not.toBeNull()
  expect(product.id).toEqual(1)
  expect(product.name).toEqual('T-Shirt')
  expect(product.constructor).toEqual(Product)
})

test('find', async () => {
  client.select.mockResolvedValue({
    data: {id: 1, name: "T-Shirt"}
  })

  const product = await Product.find(1)

  expect(client.from).toHaveBeenCalledWith("products")
  expect(client.single).toHaveBeenCalled()
  expect(client.select).toHaveBeenCalledWith("id, name")
  expect(client.eq).toHaveBeenCalledWith("id", 1)

  expect(product).not.toBeNull()
  expect(product.id).toEqual(1)
  expect(product.name).toEqual('T-Shirt')
  expect(product.constructor).toEqual(Product)
})

describe('getBy', () => {
  test('returns when found', async () => {
    client.select.mockResolvedValue({
      data: {id: 1, name: "T-Shirt"}
    })

    const product = await Product.getBy({id: 1})

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.single).toHaveBeenCalled()
    expect(client.select).toHaveBeenCalledWith("id, name")
    expect(client.eq).toHaveBeenCalledWith("id", 1)

    expect(product).not.toBeNull()
    expect(product.id).toEqual(1)
    expect(product.name).toEqual('T-Shirt')
  })

  test('throws when not found', async () => {
    client.select.mockResolvedValue({
      data: null
    })

    expect(Product.getBy({id: 1}))
      .rejects
      .toThrow('Record not found')
  })
})

describe('get', () => {
  test('returns when found', async () => {
    client.select.mockResolvedValue({
      data: {id: 1, name: "T-Shirt"}
    })

    const product = await Product.get(1)

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.single).toHaveBeenCalled()
    expect(client.select).toHaveBeenCalledWith("id, name")
    expect(client.eq).toHaveBeenCalledWith("id", 1)

    expect(product).not.toBeNull()
    expect(product.id).toEqual(1)
    expect(product.name).toEqual('T-Shirt')
  })

  test('throws when not found', async () => {
    client.select.mockResolvedValue({
      data: null
    })

    expect(Product.get(1))
      .rejects
      .toThrow('Record not found')
  })
})

test('limit', async () => {
  client.select.mockResolvedValue({
    data: [
      {id: 1, name: "T-Shirt"}
    ]
  })

  const products = await Product
    .all()
    .limit(10)

  expect(client.from).toHaveBeenCalledWith("products")
  expect(client.limit).toHaveBeenCalledWith(10)
  expect(client.select).toHaveBeenCalledWith("id, name")
  expect(products.length).toBe(1)

  expect(products[0].id).toEqual(1)
  expect(products[0].name).toEqual('T-Shirt')
})

describe("select", () => {
  beforeEach(() => {
    client.select.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })
  })

  test('all fields', async () => {
    const products = await Product
      .all()
      .select('*')

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.select).toHaveBeenCalledWith("*")
    expect(products.length).toBe(1)
  })

  test('specific fields as array', async () => {
    const products = await Product
      .all()
      .select(['id', 'price'])

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.select).toHaveBeenCalledWith("id, price")
    expect(products.length).toBe(1)
  })

  test('specific fields as string', async () => {
    const products = await Product
      .all()
      .select('id, price')

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.select).toHaveBeenCalledWith("id, price")
    expect(products.length).toBe(1)
  })
})

describe("order", () => {
  beforeEach(() => {
    client.select.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })
  })

  test('specific fields as array', async () => {
    const products = await Product
      .all()
      .order(['id', 'price'])

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.order).toHaveBeenCalledWith("id", {ascending: true})
    expect(client.order).toHaveBeenCalledWith("price", {ascending: true})
    expect(products.length).toBe(1)
  })

  test('specific fields as dictionary', async () => {
    const products = await Product
      .all()
      .order({id: 'asc', price: 'desc'})

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.order).toHaveBeenCalledWith("id", {ascending: true})
    expect(client.order).toHaveBeenCalledWith("price", {ascending: false})
    expect(products.length).toBe(1)
  })

  test('specific fields as string', async () => {
    const products = await Product
      .all()
      .order('id, price')

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.order).toHaveBeenCalledWith("id", {ascending: true})
    expect(client.order).toHaveBeenCalledWith("price", {ascending: true})
    expect(products.length).toBe(1)
  })
})

describe('where', () => {
  beforeEach(() => {
    client.select.mockResolvedValue({
      data: [
        {id: 1, name: "T-Shirt"}
      ]
    })
  })

  test('using dictionary', async () => {
    const products = await Product
      .where({type: 'tshirt'})

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.eq).toHaveBeenCalledWith("type", "tshirt")
    expect(products.length).toBe(1)
  })

  test('using key and value', async () => {
    const products = await Product
      .where('type', 'tshirt')

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.eq).toHaveBeenCalledWith("type", "tshirt")
    expect(products.length).toBe(1)
  })

  test('using key, op and value', async () => {
    const products = await Product
      .where('type', 'eq', 'tshirt')
      .where('price', '=', 100)
      .where('type', '!=', 'pants')

    expect(client.from).toHaveBeenCalledWith("products")
    expect(client.eq).toHaveBeenCalledWith("type", "tshirt")
    expect(client.eq).toHaveBeenCalledWith("price", 100)
    expect(client.neq).toHaveBeenCalledWith("type", "pants")
    expect(products.length).toBe(1)
  })
})

test('scopes', async () => {
  client.select.mockResolvedValue({
    data: [
      {id: 1, name: "T-Shirt"}
    ]
  })

  const products = await Product.expensive()

  expect(client.from).toHaveBeenCalledWith("products")
  expect(client.gt).toHaveBeenCalledWith('price', 10000)
  expect(products.length).toBe(1)
})
