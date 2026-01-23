import Redis from 'ioredis'

describe('hash field expiration integration', () => {
  const redis = new Redis()

  afterAll(() => {
    redis.disconnect()
  })

  describe('expired field behavior', () => {
    it('should not return expired field in hgetall', async () => {
      await redis.hset('hash1', 'field1', 'v1', 'field2', 'v2')
      await redis.hpexpire('hash1', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hgetall('hash1')
      expect(result).toEqual({ field2: 'v2' })
    })

    it('should not return expired field in hkeys', async () => {
      await redis.hset('hash2', 'field1', 'v1', 'field2', 'v2')
      await redis.hpexpire('hash2', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hkeys('hash2')
      expect(result).toEqual(['field2'])
    })

    it('should not return expired field in hvals', async () => {
      await redis.hset('hash3', 'field1', 'v1', 'field2', 'v2')
      await redis.hpexpire('hash3', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hvals('hash3')
      expect(result).toEqual(['v2'])
    })

    it('should not count expired field in hlen', async () => {
      await redis.hset('hash4', 'field1', 'v1', 'field2', 'v2')
      await redis.hpexpire('hash4', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hlen('hash4')
      expect(result).toBe(1)
    })

    it('should return 0 for hexists on expired field', async () => {
      await redis.hset('hash5', 'field1', 'v1')
      await redis.hpexpire('hash5', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hexists('hash5', 'field1')
      expect(result).toBe(0)
    })

    it('should return null in hmget for expired field', async () => {
      await redis.hset('hash6', 'field1', 'v1', 'field2', 'v2')
      await redis.hpexpire('hash6', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hmget('hash6', 'field1', 'field2')
      expect(result).toEqual([null, 'v2'])
    })
  })

  describe('write operations should clear field expiration', () => {
    it('hset should clear field expiration', async () => {
      await redis.hset('hash7', 'field1', 'v1')
      await redis.hexpire('hash7', 10, 'FIELDS', 1, 'field1')

      const ttlBefore = await redis.httl('hash7', 'FIELDS', 1, 'field1')
      expect(ttlBefore[0]).toBeGreaterThan(0)

      await redis.hset('hash7', 'field1', 'v2')

      const ttlAfter = await redis.httl('hash7', 'FIELDS', 1, 'field1')
      expect(ttlAfter).toEqual([-1])
    })

    it('hmset should clear field expiration', async () => {
      await redis.hset('hash8', 'field1', 'v1')
      await redis.hexpire('hash8', 10, 'FIELDS', 1, 'field1')

      await redis.hmset('hash8', 'field1', 'v2')

      const ttlAfter = await redis.httl('hash8', 'FIELDS', 1, 'field1')
      expect(ttlAfter).toEqual([-1])
    })

    it('hdel should clear field expiration', async () => {
      await redis.hset('hash9', 'field1', 'v1', 'field2', 'v2')
      await redis.hexpire('hash9', 10, 'FIELDS', 2, 'field1', 'field2')

      await redis.hdel('hash9', 'field1')

      // field1 should be gone, field2 should still have expiration
      const ttl = await redis.httl('hash9', 'FIELDS', 2, 'field1', 'field2')
      expect(ttl[0]).toBe(-2) // field doesn't exist
      expect(ttl[1]).toBeGreaterThan(0) // field2 still has TTL
    })

    it('hincrby should clear field expiration', async () => {
      await redis.hset('hash10', 'counter', '10')
      await redis.hexpire('hash10', 10, 'FIELDS', 1, 'counter')

      await redis.hincrby('hash10', 'counter', 5)

      const ttlAfter = await redis.httl('hash10', 'FIELDS', 1, 'counter')
      expect(ttlAfter).toEqual([-1])
    })

    it('hincrbyfloat should clear field expiration', async () => {
      await redis.hset('hash11', 'counter', '10.5')
      await redis.hexpire('hash11', 10, 'FIELDS', 1, 'counter')

      await redis.hincrbyfloat('hash11', 'counter', 0.5)

      const ttlAfter = await redis.httl('hash11', 'FIELDS', 1, 'counter')
      expect(ttlAfter).toEqual([-1])
    })
  })

  describe('key deletion should clean up field expirations', () => {
    it('del should clean up all field expirations', async () => {
      await redis.hset('hash12', 'field1', 'v1', 'field2', 'v2')
      await redis.hexpire('hash12', 10, 'FIELDS', 2, 'field1', 'field2')

      await redis.del('hash12')

      // Re-create the hash
      await redis.hset('hash12', 'field1', 'newvalue')

      // Should not have any expiration
      const ttl = await redis.httl('hash12', 'FIELDS', 1, 'field1')
      expect(ttl).toEqual([-1])
    })
  })

  describe('hsetnx behavior with expired fields', () => {
    it('hsetnx should set field if it is expired', async () => {
      await redis.hset('hash13', 'field1', 'v1')
      await redis.hpexpire('hash13', 100, 'FIELDS', 1, 'field1')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hsetnx('hash13', 'field1', 'newvalue')
      expect(result).toBe(1)

      const value = await redis.hget('hash13', 'field1')
      expect(value).toBe('newvalue')
    })
  })

  describe('hincrby behavior with expired fields', () => {
    it('hincrby should start from 0 if field is expired', async () => {
      await redis.hset('hash14', 'counter', '100')
      await redis.hpexpire('hash14', 100, 'FIELDS', 1, 'counter')

      await new Promise(resolve => setTimeout(resolve, 150))

      const result = await redis.hincrby('hash14', 'counter', 5)
      expect(result).toBe(5)
    })
  })
})
