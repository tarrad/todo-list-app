// Time constants (in milliseconds)
const TIME = {
  LOCK_TIMEOUT: 5 * 60 * 1000,  // 5 minutes
  LOCK_CLEANUP_INTERVAL: 5 * 60 * 1000,  // 5 minutes
  LOCK_EXTENSION_WARNING: 4 * 60 * 1000,  // 4 minutes (warning before lock expires)
  LOCK_CLEANUP_BUFFER: 60 * 1000  // 1 minute buffer for cleanup
};

// MongoDB query options
const MONGO_OPTIONS = {
  NEW: true,
  RUN_VALIDATORS: true,
  RETURN_DOCUMENT: 'after'
};

module.exports = {
  TIME,
  MONGO_OPTIONS
}; 