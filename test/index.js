var tape = require('tape')
var many = require('../')
var pull = require('pull-stream')


function rand(name, n) {
  var a = [], i = 0
  while(n--) a.push({key: name, value: i++})
  return a
}

function flatten (ary) {
  return ary.reduce(function (a, b) {
    return a.concat(b)
  }, [])
}

function compare(a, b) {
  return (a.value - b.value) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
}

function partial(t, ary) {
  var latest = {}
  ary.forEach(function (v) {
    if(latest[v.key] != null)
      t.ok(latest[v.key] < v.value)
    latest[v.key] = v.value
  })
}

function tests(name, all) {

  tape(name + ' simple', function (t) {
    pull(
      many(all.map(pull.values)),
      pull.collect(function (err, ary) {
        //verify everything is there.
        t.deepEqual(ary.sort(compare), flatten(all).sort(compare))

        //check that the result is in the correct partial order.
        partial(t, ary)
        t.end()
      })
    )
  })

  tape(name + ' abort', function (t) {

    var aborted = []
    pull(
      many(all.map(function (ary, i) {
        return pull(
          pull.values(ary),
          function (read) {
            return function (abort, cb) {
              aborted[i] = true
              read(abort, function (end, data) {
                if(end) aborted[i] = true
                cb(end, data)
              })
            }
          })
      })),
      pull.take(10),
      pull.collect(function (err, ary) {
        t.deepEqual(aborted, all.map(function () { return true }))
        partial(t, ary)
        t.end()
      })
    )
  })
}

tests('3 items', [rand('a', 7), rand('b', 5), rand('c', 5)])

tests('1 items', [rand('a', 7)])
tests('empty', [])

function error (err) {
  return function (abort, cb) {
    cb(err)
  }
}

tape('a stream errors', function (t) {
  var err = new Error('test-error')
  var aborted = []
  function check (read, i) {
    return function (abort, cb) {
      aborted[i] = true
      read(abort, function (end, data) {
        if(end) aborted[i] = true
        cb(end, data)
      })
    }
  }
  function delay(read) {
    return function (abort, cb) {
      read(abort, function (end, data) {
        setTimeout(function () {
          cb(end, data)
        }, Math.random() * 20)
      })
    }
  }

  pull(
    many([
      check(pull.values(rand('a', 5)), 0),
      check(pull.values(rand('b', 4)), 1),
      error(err)
    ]),
    pull.collect(function (err, ary) {
      t.deepEqual(aborted, [true, true])
      t.end()
    })
  )
})

