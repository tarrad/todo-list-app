const Redis = require('ioredis');

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    password: null
});

redis.on('connect', () => {
    console.log('Successfully connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Test the connection
redis.ping().then(() => {
    console.log('Redis is responding to PING');
    process.exit(0);
}).catch(err => {
    console.error('Redis PING failed:', err);
    process.exit(1);
}); 