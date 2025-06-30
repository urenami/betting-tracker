const NodeCache = require('node-cache');

// Create a cache instance with 5 min TTL
const cache = new NodeCache({ stdTTL: 300 });

module.exports = cache;