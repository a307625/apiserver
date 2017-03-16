
const config = {
  port: process.env.PORT || 3000,
  jwt: {
    jwtSecret: 'secretkey',// process.env.JWT_SECRET,
    jwtTokenExpiresIn: '30 days',
    emailTokenExpiresIn: '1 days'
  },
  apiversion: 'v1',
  hostUrl: 'http://localhost:3000',
  databaseURI: 'mongodb://127.0.0.1:27017/apiserver',
  databaseOption: null,
}




export default config
