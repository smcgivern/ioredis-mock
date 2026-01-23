import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hpexpiretime', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should return expiration timestamp in milliseconds', async () => {
      await redis.hset('myhash', 'field1', 'value1')
      const now = Date.now()
      await redis.hpexpireat('myhash', now + 100000, 'FIELDS', 1, 'field1')

      const result = await redis[command]('myhash', 'FIELDS', 1, 'field1')

      expect(result[0]).toBeGreaterThanOrEqual(now + 99000)
      expect(result[0]).toBeLessThanOrEqual(now + 101000)
    })

    it('should return -1 for field without expiration', async () => {
      await redis.hset('myhash2', 'field1', 'value1')

      const result = await redis[command]('myhash2', 'FIELDS', 1, 'field1')

      expect(result).toEqual([-1])
    })

    it('should return -2 for non-existent field', async () => {
      await redis.hset('myhash3', 'field1', 'value1')

      const result = await redis[command]('myhash3', 'FIELDS', 1, 'nonexistent')

      expect(result).toEqual([-2])
    })

    it('should return -2 for non-existent key', async () => {
      const result = await redis[command](
        'nonexistentkey',
        'FIELDS',
        1,
        'field1'
      )

      expect(result).toEqual([-2])
    })
  })
})
