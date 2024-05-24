module.exports = {
  mongoURI: process.env['MONGODB_URI'],
  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET'],
    refreshSecret: process.env['JWT_REFRESH_SECRET'],
    accessTokenExpiry: '30m',
    refreshTokenExpiry: '7d',
  },
}