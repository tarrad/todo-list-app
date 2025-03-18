const redisClient = require('../infrastructure/redis.client');
const socketService = require('./socket.service');

class LockingService {
  constructor() {
    if (LockingService.instance) {
      return LockingService.instance;
    }
    this.redisClient = redisClient;
    LockingService.instance = this;

    // Enable key space notifications
    this.redisClient.client.send_command('CONFIG', ['GET', 'notify-keyspace-events']);
    
    // Set up expiration event listener
    this.redisClient.subscribe('__keyevent@0__:expired');
    this.redisClient.onMessage((channel, key) => {
      if (channel === '__keyevent@0__:expired' && key.startsWith('task:')) {
        const taskId = key.replace('task:', '').replace(':lock', '');
        socketService.emitTaskUnlocked(taskId);
      }
    });
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
    const lockTimeout = 30; // 30 seconds timeout

    // Try to set the lock with NX (only if not exists) and EX (expiration)
    const result = await this.redisClient.set(lockKey, lockValue, 'NX', 'EX', lockTimeout);
    return result === 'OK';
  }

  // Release a lock
  async releaseLock(taskId, userId) {
    const lockKey = `task:${taskId}:lock`;
    const lockValue = await this.redisClient.get(lockKey);

    // Only release if the lock is owned by the same user
    if (lockValue === userId.toString()) {
      await this.redisClient.del(lockKey);
      socketService.emitTaskUnlocked(taskId);
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

  async getLockOwner(taskId) {
    const lockKey = `task:${taskId}:lock`;
    return await this.redisClient.get(lockKey);
  }
}

module.exports = LockingService.getInstance(); 