module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'airbnb/base',
  ],
  parser: "babel-eslint",
  rules: {
    "class-methods-use-this": "off",
    "radix": "off",
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'import/no-dynamic-require': 'warn',
    'no-param-reassign': 'warn',
    'class-methods-use-this': 'warn',
    'no-use-before-define': 'warn',
    'no-unused-vars': 'warn',
    'max-len': 'warn',
    'no-plusplus': [
      'error',
      {
        'allowForLoopAfterthoughts': true
      }
    ]
  },
};