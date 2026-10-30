require("dotenv").config();

const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  RESP: 2,
  socket: {
    reconnectStrategy: false
  }
});

const configuredCacheTtl = process.env.REDIS_CACHE_TTL_SECONDS || "60";
const configuredCacheTtlSeconds = /^\d+$/.test(configuredCacheTtl)
  ? Number(configuredCacheTtl)
  : NaN;
const cacheTtlSeconds = Number.isInteger(configuredCacheTtlSeconds) &&
  configuredCacheTtlSeconds > 0
  ? configuredCacheTtlSeconds
  : 60;

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

async function getCachedJson(key) {
  if (!redisClient.isReady) {
    return null;
  }

  try {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    console.error(`Redis cache read failed for ${key}:`, error.message);
    return null;
  }
}

async function setCachedJson(key, value) {
  if (!redisClient.isReady) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: cacheTtlSeconds
    });
  } catch (error) {
    console.error(`Redis cache write failed for ${key}:`, error.message);
  }
}

async function deleteCacheKey(key) {
  if (!redisClient.isReady) {
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis cache invalidation failed for ${key}:`, error.message);
  }
}

async function invalidateUserProductCaches(userId) {
  await Promise.all([
    deleteCacheKey(`products:user:${userId}`),
    deleteCacheKey(`low-stock:user:${userId}`)
  ]);
}

async function checkRedisConnection() {
  try {
    await connectRedis();
    const response = await redisClient.ping();
    console.log(`Redis connected: ${response}`);
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  }
}

if (require.main === module) {
  checkRedisConnection();
}

module.exports = {
  redisClient,
  connectRedis,
  getCachedJson,
  setCachedJson,
  invalidateUserProductCaches,
  checkRedisConnection
};