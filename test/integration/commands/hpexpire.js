import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hpexpire', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should set expiration in milliseconds on a hash field', async () => {
      await redis.hset('myhash', 'field1', 'value1')

      const result = await redis[command](
        'myhash',
        10000,
        'FIELDS',
        1,
        'field1'
      )

      expect(result).toEqual([1])

      const pttl = await redis.hpttl('myhash', 'FIELDS', 1, 'field1')
      expect(pttl[0]).toBeGreaterThanOrEqual(9000)
      expect(pttl[0]).toBeLessThanOrEqual(10000)
    })

    it('should expire field after TTL in milliseconds', async () => {
      await redis.hset('myhash2', 'field1', 'value1')
      await redis[command]('myhash2', 500, 'FIELDS', 1, 'field1')

      const beforeExpire = await redis.hget('myhash2', 'field1')
      expect(beforeExpire).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 600))

      const afterExpire = await redis.hget('myhash2', 'field1')
      expect(afterExpire).toBe(null)
    })

    it('should return -2 for non-existent field', async () => {
      await redis.hset('myhash3', 'field1', 'value1')

      const result = await redis[command](
        'myhash3',
        10000,
        'FIELDS',
        1,
        'nonexistent'
      )

      expect(result).toEqual([-2])
    })
  })
})
