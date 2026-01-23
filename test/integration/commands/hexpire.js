import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('hexpire', command => {
  describe(command, () => {
    const redis = new Redis()

    afterAll(() => {
      redis.disconnect()
    })

    it('should set expiration on a hash field', async () => {
      await redis.hset('myhash', 'field1', 'value1')

      const result = await redis[command]('myhash', 10, 'FIELDS', 1, 'field1')

      expect(result).toEqual([1])
    })

    it('should return -2 for non-existent field', async () => {
      await redis.hset('myhash2', 'field1', 'value1')

      const result = await redis[command](
        'myhash2',
        10,
        'FIELDS',
        1,
        'nonexistent'
      )

      expect(result).toEqual([-2])
    })

    it('should return -2 for non-existent key', async () => {
      const result = await redis[command](
        'nonexistentkey',
        10,
        'FIELDS',
        1,
        'field1'
      )

      expect(result).toEqual([-2])
    })

    it('should handle multiple fields', async () => {
      await redis.hset('myhash3', 'field1', 'v1', 'field2', 'v2')

      const result = await redis[command](
        'myhash3',
        10,
        'FIELDS',
        3,
        'field1',
        'field2',
        'nonexistent'
      )

      expect(result).toEqual([1, 1, -2])
    })

    it('should expire field after TTL', async () => {
      await redis.hset('myhash4', 'field1', 'value1')
      await redis[command]('myhash4', 1, 'FIELDS', 1, 'field1')

      const beforeExpire = await redis.hget('myhash4', 'field1')
      expect(beforeExpire).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 1100))

      const afterExpire = await redis.hget('myhash4', 'field1')
      expect(afterExpire).toBe(null)
    })

    describe('NX option', () => {
      it('should set expiration only if field has no expiration', async () => {
        await redis.hset('myhash5', 'field1', 'value1')

        const result1 = await redis[command](
          'myhash5',
          10,
          'NX',
          'FIELDS',
          1,
          'field1'
        )
        expect(result1).toEqual([1])

        const result2 = await redis[command](
          'myhash5',
          20,
          'NX',
          'FIELDS',
          1,
          'field1'
        )
        expect(result2).toEqual([0])
      })
    })

    describe('XX option', () => {
      it('should set expiration only if field has expiration', async () => {
        await redis.hset('myhash6', 'field1', 'value1')

        const result1 = await redis[command](
          'myhash6',
          10,
          'XX',
          'FIELDS',
          1,
          'field1'
        )
        expect(result1).toEqual([0])

        await redis[command]('myhash6', 10, 'FIELDS', 1, 'field1')

        const result2 = await redis[command](
          'myhash6',
          20,
          'XX',
          'FIELDS',
          1,
          'field1'
        )
        expect(result2).toEqual([1])
      })
    })

    describe('GT option', () => {
      it('should set expiration only if new TTL > current TTL', async () => {
        await redis.hset('myhash7', 'field1', 'value1')
        await redis[command]('myhash7', 10, 'FIELDS', 1, 'field1')

        const result1 = await redis[command](
          'myhash7',
          5,
          'GT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result1).toEqual([0])

        const result2 = await redis[command](
          'myhash7',
          20,
          'GT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result2).toEqual([1])
      })

      it('should not set expiration if field has no expiration (infinite)', async () => {
        await redis.hset('myhash8', 'field1', 'value1')

        const result = await redis[command](
          'myhash8',
          10,
          'GT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result).toEqual([0])
      })
    })

    describe('LT option', () => {
      it('should set expiration only if new TTL < current TTL', async () => {
        await redis.hset('myhash9', 'field1', 'value1')
        await redis[command]('myhash9', 10, 'FIELDS', 1, 'field1')

        const result1 = await redis[command](
          'myhash9',
          20,
          'LT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result1).toEqual([0])

        const result2 = await redis[command](
          'myhash9',
          5,
          'LT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result2).toEqual([1])
      })

      it('should set expiration if field has no expiration (infinite)', async () => {
        await redis.hset('myhash10', 'field1', 'value1')

        const result = await redis[command](
          'myhash10',
          10,
          'LT',
          'FIELDS',
          1,
          'field1'
        )
        expect(result).toEqual([1])
      })
    })
  })
})
