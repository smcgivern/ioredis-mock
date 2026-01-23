import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hexpiretime', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should return expiration timestamp in seconds', async () => {
      await redis.hset('myhash', 'field1', 'value1')
      const now = Math.floor(Date.now() / 1000)
      await redis.hexpireat('myhash', now + 100, 'FIELDS', 1, 'field1')

      const result = await redis[command]('myhash', 'FIELDS', 1, 'field1')

      expect(result[0]).toBeGreaterThanOrEqual(now + 99)
      expect(result[0]).toBeLessThanOrEqual(now + 101)
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

    it('should handle multiple fields', async () => {
      await redis.hset('myhash4', 'field1', 'v1', 'field2', 'v2')
      const now = Math.floor(Date.now() / 1000)
      await redis.hexpireat('myhash4', now + 100, 'FIELDS', 1, 'field1')

      const result = await redis[command](
        'myhash4',
        'FIELDS',
        3,
        'field1',
        'field2',
        'nonexistent'
      )

      expect(result[0]).toBeGreaterThanOrEqual(now + 99)
      expect(result[1]).toBe(-1)
      expect(result[2]).toBe(-2)
    })
  })
})
