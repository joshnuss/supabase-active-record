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

Each model should inherit from `ActiveRecord`.

```javascript
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

There are many way to query, you can query for all:

```javasacript
const products = await Person.all()
```

To find a specific record:

```javascript
const product = await Person.findBy({firstName: "Josh", lastName: "Nussbaum"})
```

or if you know the id, use:

```javascript
const product = await Person.find(41)
```

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
