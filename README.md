# pull-many

Combine many streams into one stream, as they come, while respecting back pressure.

A chunk is read from each stream,
and the next available chunk is
selected in a round-robbin.

If a any stream errors

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
```

## License

MIT
