export default class MemoryCacheProvider {
  constructor(options) {
    this.cache = {};
    this.expired = options.expired * 1000;
  }

  async get(key) {
    const result = this.cache[key];
    if (result) {
      const now = new Date().getTime();
      if (result.created + result.expired > now) {
        return Promise.resolve(result.value);
      }
    }
    return Promise.resolve(null);
  }

  async set(key, value, expired) {
    const now = new Date().getTime();
    this.cache[key] = {
      value,
      created: now,
      expired: expired || this.expired,
    };
    return Promise.resolve();
  }
}
