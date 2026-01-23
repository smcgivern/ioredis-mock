import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hpersist', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should remove expiration from field', async () => {
      await redis.hset('myhash', 'field1', 'value1')
      await redis.hexpire('myhash', 10, 'FIELDS', 1, 'field1')

      const ttlBefore = await redis.httl('myhash', 'FIELDS', 1, 'field1')
      expect(ttlBefore[0]).toBeGreaterThan(0)

      const result = await redis[command]('myhash', 'FIELDS', 1, 'field1')
      expect(result).toEqual([1])

      const ttlAfter = await redis.httl('myhash', 'FIELDS', 1, 'field1')
      expect(ttlAfter).toEqual([-1])
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
      await redis.hexpire('myhash4', 10, 'FIELDS', 1, 'field1')

      const result = await redis[command](
        'myhash4',
        'FIELDS',
        3,
        'field1',
        'field2',
        'nonexistent'
      )

      expect(result).toEqual([1, -1, -2])
    })
  })
})
