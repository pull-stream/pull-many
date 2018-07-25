# pull-many

Combine many streams into one stream, as they come, while respecting back pressure.

A chunk is read from each stream,
and the next available chunk is
selected in a round-robbin.

If a stream errors, other streams continue to be read from.
The error is only passed to the sink when all streams have ended.

## Example

``` js

var pull = require('pull-stream')
var many = require('pull-many')

pull(
  many([
    pull.values([1,2,3]),
    pull.values([1,3,5]),
    pull.values([2,4,6])
  ]),
  pull.collect(function (err, ary) {
    if(err) throw err
    console.log(ary)
    //=> [1, 1, 2, 2, 3, 4, 3, 5, 6]
  })
)

// add streams later too
var m = many()

pull(
  m,
  pull.collect(function (err, ary) {
    if(err) throw err
    console.log(ary)
    //=> [1,2,3,4,5,6]
  })
)

m.add(pull.values([1,2,3]))
m.add(pull.values([4,5,6]))
```

## License

MIT
