import { createClient } from 'redis';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let queues = {};
let workers = {};
let redisConnected = false;

export async function initializeRedis() {
  try {
    redisClient = createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', () => {
      // Silently fail - Redis is optional
    });
    redisClient.on('connect', () => {
      console.log('✓ Redis connected');
      redisConnected = true;
    });

    await redisClient.connect();
    redisConnected = true;
    console.log('✓ Redis initialized');

    // Initialize Bull queues
    initializeQueues();
  } catch (error) {
    console.warn('⚠️  Redis unavailable - caching & queues disabled');
  }

  return redisClient;
}

function initializeQueues() {
  if (!redisConnected) return;

  const connectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  };

  try {
    queues.messages = new Queue('messages', { connection: connectionOptions });
    queues.broadcast = new Queue('broadcast', { connection: connectionOptions });
    queues.campaigns = new Queue('campaigns', { connection: connectionOptions });
    queues.otp = new Queue('otp', { connection: connectionOptions });
    console.log('✓ Bull queues initialized');
  } catch (error) {
    console.warn('⚠️  Bull queues initialization failed');
  }
}

export function getRedisClient() {
  return redisClient;
}

export function getQueue(queueName) {
  return queues[queueName] || null;
}

export async function cacheSet(key, value, ttl = 3600) {
  if (!redisClient) return null;
  try {
    return await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn('Cache set failed:', error.message);
    return null;
  }
}

export async function cacheGet(key) {
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Cache get failed:', error.message);
    return null;
  }
}

export async function cacheDel(key) {
  if (!redisClient) return null;
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.warn('Cache delete failed:', error.message);
    return null;
  }
}

export async function cacheFlush() {
  if (!redisClient) return null;
  try {
    return await redisClient.flushDb();
  } catch (error) {
    console.warn('Cache flush failed:', error.message);
    return null;
  }
}

export default redisClient;
