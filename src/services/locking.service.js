const redisClient = require('../infrastructure/redis.client');
const { TIME } = require('../config/constants');

class LockingService {
  constructor() {
    if (LockingService.instance) {
      return LockingService.instance;
    }
    this.redisClient = redisClient;
    LockingService.instance = this;
  }

  static getInstance() {
    if (!LockingService.instance) {
      LockingService.instance = new LockingService();
    }
    return LockingService.instance;
  }

  // Lock a resource with NX (Not Exists) and expiration
  async acquireLock(taskId, userId) {
    const lockKey = `task:${taskId}:lock`;
    const lockValue = userId.toString();
    const lockTimeout = TIME.LOCK_TIMEOUT; // Convert to seconds for Redis

    // Try to set the lock with NX (only if not exists) and EX (expiration)
    const result = await this.redisClient.set(lockKey, lockValue, 'NX', 'PX', lockTimeout);
    return result === 'OK';
  }

  // Release a lock
  async releaseLock(taskId, userId) {
    const lockKey = `task:${taskId}:lock`;
    const lockValue = await this.redisClient.get(lockKey);

    // Only release if the lock is owned by the same user
    if (lockValue === userId.toString()) {
      await this.redisClient.del(lockKey);
      return true;
    }
    return false;
  }

  // Check if a resource is locked
  async isLocked(taskId) {
    const lockKey = `task:${taskId}:lock`;
    const lockValue = await this.redisClient.get(lockKey);
    return lockValue !== null;
  }
}

module.exports = LockingService.getInstance(); 