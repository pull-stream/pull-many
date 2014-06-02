
var pull = require('pull-stream')
var async = require('interleavings')
var many = require('../')
var assert = require('assert')

async.test(strange, function (err, results, stats) {
    console.log(results)
    assert.equal(stats.failures, 0)
  })

function strange (async) {

    function p (read) {
      return function (abort, cb) {
        read(abort, async(cb))
      }
    }

    pull(
      //pull many must return a result in the same partial order.
      //so if we have a stream of even and a stream of odd numbers
      //then those should be in the same order in the output.
      many([
        pull.values([1,3,5,7]),
        pull.values([2,4,6,8])
      ].map(p)),
      function (read) {
        return function (abort, cb) {
          read(abort, function (end, data) {
            console.log(end, data)
            cb(end, data)
          })
        }
      },
      pull.collect(function (err, ary) {
        console.log(ary)
        var odd  = ary.filter(function (e) { return e % 2 })
        var even = ary.filter(function (e) { return !(e % 2) })

        assert.deepEqual(even, [2,4,6,8])
        assert.deepEqual(odd, [1,3,5,7])
        async.done()
      })
    )

  }


//strange(async(54, console.error))

