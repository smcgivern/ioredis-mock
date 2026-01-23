import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hpexpireat', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should set expiration at specific Unix timestamp in milliseconds', async () => {
      await redis.hset('myhash', 'field1', 'value1')
      const expireAt = Date.now() + 100000

      const result = await redis[command](
        'myhash',
        expireAt,
        'FIELDS',
        1,
        'field1'
      )

      expect(result).toEqual([1])

      const pexpiretime = await redis.hpexpiretime(
        'myhash',
        'FIELDS',
        1,
        'field1'
      )
      expect(pexpiretime[0]).toBe(expireAt)
    })

    it('should expire field at the specified timestamp', async () => {
      await redis.hset('myhash2', 'field1', 'value1')
      const expireAt = Date.now() + 500

      await redis[command]('myhash2', expireAt, 'FIELDS', 1, 'field1')

      const beforeExpire = await redis.hget('myhash2', 'field1')
      expect(beforeExpire).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 600))

      const afterExpire = await redis.hget('myhash2', 'field1')
      expect(afterExpire).toBe(null)
    })

    it('should return -2 for non-existent field', async () => {
      await redis.hset('myhash3', 'field1', 'value1')
      const expireAt = Date.now() + 100000

      const result = await redis[command](
        'myhash3',
        expireAt,
        'FIELDS',
        1,
        'nonexistent'
      )

      expect(result).toEqual([-2])
    })

    it('should return -2 for non-existent key', async () => {
      const expireAt = Date.now() + 100000

      const result = await redis[command](
        'nonexistentkey',
        expireAt,
        'FIELDS',
        1,
        'field1'
      )

      expect(result).toEqual([-2])
    })
  })
})
