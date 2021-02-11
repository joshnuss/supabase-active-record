const filterOps = {
  '=': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte'
}

export default class Scope {
  constructor({config, klass, client}) {
    this._config = config
    this._class = klass
    this._client = client
    this._fields = Object.keys(this._config.fields).join(', ')
    this._limit = null
    this._order = {}
    this._filters = {}
    this._type = 'query'
    this._updates = null
  }

  where(...args) {
    let filters = {}, field, op, value

    switch (args.length) {
      case 1:
        Object.entries(args[0]).forEach(([key, value]) => {
          filters[key] = { op: 'eq', value }
        })
        break
      case 2:
        field = args[0]
        value = args[1]

        filters[field] = { op: 'eq', value}
        break
      case 3:
        field = args[0]
        op = args[1]
        value = args[2]

        filters[field] = { op, value }
        break
    }

    Object.entries(filters).forEach(([key, filter]) => {
      addFilter(this._filters, key, filter)
    })

    return this
  }

  single() {
    this._single = true

    return this
  }

  select(fields) {
    this._fields = Array.isArray(fields) ? fields.join(', ') : fields

    return this
  }

  order(sort) {
    if (Array.isArray(sort)) {
      sort.forEach(attr => this._order[attr] = "asc")
    } else if (typeof(sort) == 'string') {
      sort.split(",").map(s => s.trim()).forEach(attr => this._order[attr] = "asc")
    } else {
      Object.entries(sort).forEach(([attr, direction]) => this._order[attr] = direction)
    }
    return this
  }

  limit(size) {
    this._limit = size

    return this
  }

  update(fields) {
    this._type = 'update'
    this._updates = fields

    return this
  }

  delete(fields) {
    this._type = 'delete'

    return this
  }

  then(resolve, reject) {
    let query = this._client
      .from(this._config.table)

    if (this._type == 'query') {
      Object.entries(this._order).forEach(([key, direction]) => {
        query = query.order(key, {ascending: direction == "asc"})
      })

      query = query.select(this._fields)

      if (this._limit) {
        query = query.limit(this._limit)
      }

      if (this._single) {
        query = query.single()
      }

    } else if (this._type == 'update') {
      query = query.update(this._updates)
    } else if (this._type == 'delete') {
      query = query.delete()
    }

    Object.entries(this._filters).forEach(([key, filters]) => {
      filters.forEach(filter => {
        const op = filterOps[filter.op] || filter.op
        query = query[op](key, filter.value)
      })
    })

    query
      .then(({data}) => {
        if (this._single) {
          const record = hydrate(this._class, data)
          resolve(record)
        } else {
          const records = data.map(record => hydrate(this._class, record))
          resolve(records)
        }
      })
      .catch(reject)
  }
}

function hydrate(klass, data) {
  if (!data) return null

  return new klass(data, {hydrating: true})
}

function addFilter(filters, key, {op, value}) {
  if (!filters[key]) {
    filters[key] = []
  }

  filters[key].push({op, value})
}
