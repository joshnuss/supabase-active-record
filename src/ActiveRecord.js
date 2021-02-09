import Query from './Query.js'

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export default class ActiveRecord {
  static all() {
    return new Query({
      config: this.config,
      klass: this,
      client: ActiveRecord.client
    })
  }

  static where(...args) {
    return this
      .all()
      .where(...args)
  }

  static findBy(params) {
    return this
      .all()
      .where(params)
      .single()
  }

  static async getBy(params) {
    const record = await this.findBy(params)

    if (record) return record

    throw new NotFoundError('Record not found')
  }

  static find(id) {
    return this.findBy({id})
  }

  static get(id) {
    return this.getBy({id})
  }

  static async create(fields = {}) {
    const Klass = this
    const record = new Klass(fields)
    const { valid, errors } = await record.save()

    return { valid, errors, record }
  }

  constructor(fields = {}, options = {}) {
    const fieldDefs = Object.entries(this.constructor.config.fields || {})
    const keys = Object.keys(fields)

    Object.assign(this, fields)

    fieldDefs.forEach(([name, config]) => {
      if (!keys.includes(name))
        this[name] = null
    })

    if (options.hydrating) {
      this.isNewRecord = false
      this.isDirty = false
    } else {
      this.isNewRecord = true
      this.isDirty = true
    }
  }

  get isPersisted() {
    return !this.isDirty
  }

  async validate() {
    const validations = Object.entries(this.constructor.config.validate || {})

    if (validations.length == 0)
      return { valid: true, errors: {} }

    let errors = {}
    const promises = validations.map(async ([key, validation]) => {
      const error = await validation(this, key)

      if (error) {
        errors[key] = [...(errors[key] || []), error]
      }
    })

    await Promise.all(promises)
    const valid = Object.keys(errors).length == 0

    return {valid, errors}
  }

  async save() {
    const result = await this.validate()
    const config = this.constructor.config

    if (!result.valid) return result

    const fields = Object.keys(config.fields).reduce((acc, key) => { acc[key] = this[key]; return acc }, {})
    const {data} = await ActiveRecord
      .client
      .from(config.table)
      .insert(fields)

    this.isNewRecord = false
    this.isDirty = false
    this.id = data[0].id

    return { valid: true, errors: {} }
  }
}
