module.exports = {
  apps: [{
    name: 'dev:server',
    script: './build-server/index.js',
    watch: ['./build', './build-server'],
    // ignore_watch  : ['static'],
    watch_options: {
      followSymlinks: false
    },
    env: {
      'NODE_ENV': 'development',
    }
  }]
}