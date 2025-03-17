const redisClient = require('../infrastructure/redis.client');
const { TIME } = require('../config/constants');
const Task = require('../models/task.model');
const mongoose = require('mongoose');

class LockingService {
  constructor() {
    if (LockingService.instance) {
      return LockingService.instance;
    }

    // Subscribe to key space notifications
    redisClient.subscribe('__keyevent@0__:expired');
    
    // Handle expired keys
    redisClient.onMessage(async (channel, key) => {
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

  // Lock a resource with NX (Not Exists) and expiration
  async acquireLock(resourceId, userId, timeoutSeconds = TIME.LOCK_TIMEOUT / 1000) {
    const lockKey = `lock:${resourceId}`;
    const lockValue = userId.toString();
    
    // Try to set the lock with NX (only if it doesn't exist)
    const result = await redisClient.setex(lockKey, timeoutSeconds, lockValue);
    return result === 'OK';
  }

  // Release a lock
  async releaseLock(resourceId, userId) {
    const lockKey = `lock:${resourceId}`;
    
    // Get the current lock value
    const currentLock = await redisClient.get(lockKey);
    
    // Only unlock if the lock belongs to this user
    if (currentLock === userId.toString()) {
      await redisClient.del(lockKey);
      return true;
    }
    
    return false;
  }

  // Check if a resource is locked
  async isLocked(resourceId) {
    const lockKey = `lock:${resourceId}`;
    const lockValue = await redisClient.get(lockKey);
    return lockValue !== null;
  }

  // Get the user who locked the resource
  async getLockOwner(resourceId) {
    const lockKey = `lock:${resourceId}`;
    return await redisClient.get(lockKey);
  }
}

module.exports = new LockingService(); 