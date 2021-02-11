Supabase ActiveRecord
----------------

ActiveRecord implementation for Supabase (experimental).

## Features

- CRUD
- Validations
- Relationships `belongsTo()`, `hasMany()`
- Named scopes
- Filtering
- Joining
- Isomorphic

# Examples

## Models

A model is a class that inherits from `ActiveRecord`:

```javascript
import { ActiveRecord } from 'supabase-active-record'

class Person extends ActiveRecord {
  // define table name and fields
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

To get all records:

```javascript
const people = await Person.all()
```

To find a single record:

```javascript
const person = await Person.findBy({firstName: "Josh", lastName: "Nussbaum"})
```

To find by `id`:

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

Filters can be added by chaining `.where()` calls together:

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

Data can be ordered by one or more columns:

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
await Product
  .all()
  .limit(10) // 10 records max
```

### Joining

(not yet working)

Multiple models can be joined together

```javascript
import { ActiveRecord, belongsTo } from 'supabase-active-record'

class Product extends ActiveRecord {
  static config = [
    table: 'products',
    fields: {
      id: 'serial',
      name: 'string',
      category: belongsTo(Category)
    }
  ]
}

const product = await Product
  .find(1)
  .join('category')

console.log(product.category) // Category { name: 'T-Shirts' }
```

## Scopes

Named scopes can be defined using `static` functions:

```javascript
class Product extends ActiveRecord {
  static config = {
    table: 'products'
  }

  static expensive() {
    return this
      .where('price', '>', 100)
      .order({price: 'desc'})
      .limit(3)
  }
}
```

And then call the scope like this:

```javascript
const products = await Product.expensive()
```

## Validation

Multiple validations are supported. They are defined in `config.validate`:

```javascript
import { ActiveRecord, is } from 'supabase-active-record'

class Product extends ActiveRecord {
  static config = {
    table: 'products',
    fields: {
      name: 'string',
      price: 'number'
    },
    validates: {
      name: is.required()
      price: is.type('number')
    }
  }
}
```

Supported validations: `is.required()`, `is.type()`, `is.length()`, `is.format()`

### Custom validation

A validation is a function that takes an `object` (the record) and returns a `string` (the error message).

```javascript
import { ActiveRecord, is } from 'supabase-active-record'

class Product extends ActiveRecord {
  static config = {
    // ...
    validates: {
      name: record => {
        if (record.name.length < 3)
          return 'is too short'
      }
    }
  }
}
```

## Creating

To create a single record:

```javascript
const {valid, errors, record} = await Product.create({name: 'Shirt'})
```

or using an instance:

```javascript
const product = new Product()

product.name = 'Shirt'
product.price = 100

const { valid, errors } = await product.save()
```

To create multiple records at once:

```javascript
await Product.create([
  {name: 'Shirt', price: 20},
  {name: 'Pants', price: 100}
])
```

## Updating

To update a record, call `record.save()`:

```javascript
// get existing record
const product = await Product.find(1)

// change record
product.price++

// save record
const {valid, errors} = await product.save()
```

or update multiple records at once:

```javascript
// update all records where price=1 to price=2
await Product
  .where('price', '=', 1)
  .update({price: 2})
```

## Deleting

To delete a record:

```javascript
// get existing record
const product = await Product.find(1)

// delete it
await product.delete()
```

or delete multiple records at once:

```javascript
// delete all records where price > 1000
await Product
  .where('price', '>', 1000)
  .delete()
```

## Instance methods

Instance methods, getters and setters can be added to the model:

```javascript
class Person extends ActiveRecord {
  // define a getter
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  // define a setter
  set fullName(value) {
    const [firstName, lastName] = value.split(' ')

    this.firstName = firstName
    this.lastName = lastName
  }

  // define a method to update name
  anonymize() {
    this.firstName = 'Anonymous'
    this.lastName = 'Anonymous'
  }
}

const person = new Person({firstName: "Steve", lastName: "Jobs"})
console.log(person.fullName) // Steve Jobs
person.anonymize()
console.log(person.fullName) // Anonymous Anonymous
```

## Change Tracking

When a record is changed, `record.isChanged` is set to `true`. There is also `record.isPersisted` which is the opposite of `record.isChanged`.

```javascript
const product = new Product()

console.log(product.isNewRecord) // true
console.log(product.isChanged) // true
console.log(product.isPersisted) // false (opposite of isChanged)

await product.save()

// now it's no longer a new record or dirty
console.log(product.isNewRecord) // false
console.log(product.isChanged) // false
console.log(product.isPersisted) // true
```

# Setup

Install the [npm package](https://www.npmjs.com/package/supabase-active-record):

```bash
yarn add supabase-active-record
```

Setup the supabase client:

```js
import { createClient } from '@supabase/supabase-js'
import { ActiveRecord } from 'supabase-active-record'

ActiveRecord.client = createClient("<your supabase url>", "<your supabase key>")
```
