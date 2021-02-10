supabase-active-record
----------------

ActiveRecord implementation for Supabase (experimental).

## Features

- CRUD
- Validations
- Relationships `belongsTo()`, `hasMany()`
- Scopes
- Filtering and joining
- Isomorphic

# Examples

## Subclassing

Each model should inherit from `ActiveRecord`:

```javascript
import { ActiveRecord } from 'supabase-active-record'

class Person extends ActiveRecord {
  static config = {
    table: 'people',
    fields: {
      id: 'serial',
      firstName: 'string',
      lastName: 'string'
    }
  }
}
```

## Querying

There are many ways to query the db, you can query for all:

```javascript
const people = await Person.all()
```

To find a single record:

```javascript
const person = await Person.findBy({firstName: "Josh", lastName: "Nussbaum"})
```

or if you know the `id`, use:

```javascript
const person = await Person.find(41)
```

`ActiveRecord.find()` and `ActiveRecord.findBy()` return `null` when no record is found. If you perfer to raise an `NotFoundError`, use `ActiveRecord.get()` or  `ActiveRecord.getBy()`:

```javascript
try {
  const person = await Person.get(41)
} catch (error) {
  console.error(error.name) // RecordNotFound
}
```

### Filters

Filters can be added to queries using the `where()` function or by chaining multiple `where()`'s together:

```javascript
// single filter
await Person.where({lastName: 'Jobs'})

// multiple filters
await Person
  .where({firstName: 'Steve', lastName: 'Jobs'})

// equivalent
await Person
  .where('firstName', 'Steve')
  .where('lastName', 'Jobs')

// equivalent, using operators
await Person
  .where('firstName', '=', 'Steve')
  .where('lastName', '=', 'Jobs')

// supported operators: =, !=, >, <, <=, >=, like, ilike
await Product
  .where('price', '>', 100)
  .where('name', 'like', '*shirt*')
```

### Ordering

Data can be ordered by calling `.order()`:

```javascript
// sort by column
await Product
  .all()
  .order('name')

// sort by multiple columns
await Product
  .all()
  .order(['price', 'name'])

// ascending and descending can be specified as `asc` and `desc`
await Product
  .all()
  .order({price: 'desc', name: 'asc'})
```

### Limiting

To limit the number of records returned:

```javascript
// returns 10 records max
await Product
  .all()
  .limit(10)
```

## Scopes

## Creating

## Updating

## Deleting

## Validation

## Instance methods

## Dirty Tracking

# Setup

Install the npm package:

```bash
yarn add supabase-active-record
```

Setup the supabase client:

```js
import { createClient } from '@supabase/supabase-js'
import { ActiveRecord } from 'supabase-active-record'

ActiveRecord.client = createClient("<your supabase url>", "<your supabase key>")
```
