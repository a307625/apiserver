import jwt from 'koa-jwt'
import Config from '../config'

export const Token = (userID) => {
  return jwt.sign( { userID } , Config.jwt.jwtSecret, {algorithm: 'HS512', expiresIn: Config.jwt.jwtTokenExpiresIn})
}

export const TokenVerify = (token) => {
  return new Promise((resolve, reject)=>{
    jwt.verify(token, Config.jwt.jwtSecret, (err, decoded)=>{
      if(err){
        reject(err)
      }
      const userID = decoded.userID
      resolve(userID)
    })
  })
}
