import redis from 'redis';

const { promisify } = require('util');

export default class RedisCacheProvider {
  constructor(options) {
    this.expired = options.expired;
    const client = redis.createClient(options.redis);
    this.client = client;
    this.getAsync = promisify(client.get).bind(client);
    this.setExAsync = promisify(client.setex).bind(client);
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, expired) {
    return this.setExAsync(key, expired || this.expired, value);
  }
}
