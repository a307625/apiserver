const env = process.env.NODE_ENV || 'development'
const config = {
  development: require('./development.js'),
  productin: require('./production.js'),
}

module.exports = config[env]
