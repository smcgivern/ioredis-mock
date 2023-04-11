import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('sdiffstore', command => {
  describe(command, () => {
    const redis = new Redis()
    afterAll(() => {
      redis.disconnect()
    })

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should store the difference between the first set and all the successive sets',
      () => {
        const redis = new Redis({
          data: {
            key1: new Set(['a', 'b', 'c', 'd']),
            key2: new Set(['c']),
            // key3: keys that do not exist are considered to be empty sets
            key4: new Set(['a', 'c', 'e']),
          },
        })

        return redis[command]('result', 'key1', 'key2', 'key3', 'key4')
          .then(count => expect(count).toEqual(2))
          .then(() => redis.smembers('result'))
          .then(result => expect(result).toEqual(['b', 'd']))
      }
    )

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should throw an exception if the target key is not of a set',
      () => {
        const redis = new Redis({
          data: {
            foo: 'not a set',
          },
        })

        return expect(redis.sdiffstore('dest', 'foo', 'bar')).rejects.toEqual(
          Error('Key foo does not contain a set')
        )
      }
    )

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should throw an exception if a member key contains something other than a set',
      () => {
        const redis = new Redis({
          data: {
            foo: new Set(),
            bar: 'not a set',
          },
        })

        return expect(redis.sdiffstore('dest', 'foo', 'bar')).rejects.toEqual(
          Error('Key bar does not contain a set')
        )
      }
    )

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      "should return 0 if sources don't exists",
      () => {
        return redis[command]('dest', 'foo', 'bar')
          .then(count => expect(count).toEqual(0))
          .then(() => redis.smembers('dest'))
          .then(result => expect(result).toEqual([]))
      }
    )
  })
})
