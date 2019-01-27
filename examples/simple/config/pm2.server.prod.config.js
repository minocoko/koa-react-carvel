
module.exports = {
  apps: [{
    name: 'prod:server',
    script: './build-server/index.js',
    watch: false,
    instances: process.platform === 'win32' ? 1 : 0,
    env: {
      'NODE_ENV': 'production',
    }
  }]
}