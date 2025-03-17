const redisClient = require('../infrastructure/redis.client');
const { TIME } = require('../config/constants');
const Task = require('../models/task.model');
const mongoose = require('mongoose');

class LockingService {
  constructor() {
    if (LockingService.instance) {
      return LockingService.instance;
    }

    this.redisClient = redisClient;
    
    // Subscribe to key space notifications
    this.redisClient.subscribe('__keyevent@0__:expired');
    
    // Handle expired keys
    this.redisClient.onMessage(async (channel, key) => {
      if (channel === '__keyevent@0__:expired' && key.startsWith('lock:')) {
        const resourceId = key.replace('lock:', '');
        console.log(`Lock expired for key: ${key}`);
        
        // Only cleanup MongoDB locks for tasks
        try {
          // Only attempt cleanup if MongoDB is connected
          if (mongoose.connection.readyState === 1) {
            await Task.updateOne(
              { _id: resourceId },
              { $unset: { lockedBy: 1, lockTimeout: 1 } }
            );
            console.log(`Cleaned up MongoDB lock for task ${resourceId} after Redis key expired`);
          } else {
            console.log(`MongoDB not connected, skipping cleanup for task ${resourceId}`);
          }
        } catch (error) {
          console.error(`Error cleaning up MongoDB lock for task ${resourceId}:`, error);
        }
      }
    });

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
    const lockTimeout = TIME.LOCK_TIMEOUT / 1000; // Convert to seconds for Redis

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