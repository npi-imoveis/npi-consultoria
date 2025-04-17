import NodeCache from 'node-cache';

// Create a new cache instance with standard TTL of 5 minutes
const cache = new NodeCache({
    stdTTL: 300, // Time to live in seconds (5 minutes)
    checkperiod: 320, // Check for expired keys every 320 seconds
});

export default cache; 