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

  constructor(fields = {}) {
    Object.assign(this, fields)
  }

  get isPersisted() {
    return !this.isDirty
  }
}
