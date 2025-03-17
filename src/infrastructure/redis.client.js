const Redis = require('ioredis');

class RedisClient {
  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    // Create a client for regular commands
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    // Create a separate client for subscriptions
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    RedisClient.instance = this;
  }

  // Basic Redis operations
  async get(key) {
    return this.client.get(key);
  }

  async set(key, value) {
    return this.client.set(key, value);
  }

  async setex(key, seconds, value) {
    return this.client.setex(key, seconds, value);
  }

  async del(key) {
    return this.client.del(key);
  }

  async subscribe(channel) {
    return this.subscriber.subscribe(channel);
  }

  // Event handling
  onMessage(callback) {
    this.subscriber.on('message', callback);
  }
}

module.exports = new RedisClient(); 