import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('rpoplpush', (command, equals) => {
  describe(command, () => {
    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should remove one item from the tail of the source list',
      () => {
        const redis = new Redis({
          data: {
            foo: ['foo', 'bar'],
          },
        })

        return redis[command]('foo', 'bar').then(() =>
          expect(redis.data.get('foo')).toEqual(['foo'])
        )
      }
    )

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should add one item to the head of the destination list',
      () => {
        const redis = new Redis({
          data: {
            foo: ['foo', 'bar'],
            bar: ['baz'],
          },
        })

        return redis[command]('foo', 'bar').then(() =>
          expect(redis.data.get('bar')).toEqual(['bar', 'baz'])
        )
      }
    )

    it('should return null if the source list does not exist', () => {
      const redis = new Redis({
        data: {},
      })

      return redis[command]('foo', 'bar').then(item =>
        expect(item).toEqual(null)
      )
    })

    it('should return null if the source list is empty', () => {
      const redis = new Redis({
        data: {
          foo: [],
        },
      })

      return redis[command]('foo', 'bar').then(item =>
        expect(item).toEqual(null)
      )
    })

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)('should return the item', () => {
      const redis = new Redis({
        data: {
          foo: ['foo', 'bar'],
        },
      })

      return redis[command]('foo', 'bar').then(item => expect(item).toBe('bar'))
    })

    // @TODO Rewrite test so it runs on a real Redis instance
    ;(process.env.IS_E2E ? it.skip : it)(
      'should return buffer values correctly',
      () => {
        const bufferVal = Buffer.from('bar')
        const redis = new Redis({
          data: {
            foo: ['foo', bufferVal],
          },
        })

        return redis[command]('foo', bufferVal).then(item =>
          expect(equals(item, bufferVal)).toBe(true)
        )
      }
    )

    it('should throw an exception if the source key contains something other than a list', () => {
      const redis = new Redis({
        data: {
          foo: 'not a list',
          bar: [],
        },
      })

      return redis[command]('foo', 'bar').catch(err =>
        expect(err.message).toBe(
          'WRONGTYPE Operation against a key holding the wrong kind of value'
        )
      )
    })

    it('should throw an exception if the destination key contains something other than a list', () => {
      const redis = new Redis({
        data: {
          foo: [],
          bar: 'not a list',
        },
      })

      return redis[command]('foo', 'bar').catch(err =>
        expect(err.message).toBe('Key bar does not contain a list')
      )
    })
  })
})
