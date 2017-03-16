import jwt from 'koa-jwt'
import Config from '../config'

export const Token = (userID) => {
  return jwt.sign({ userID }, Config.jwt.jwtSecret, {algorithm: 'HS512', expiresIn: Config.jwt.jwtTokenExpiresIn})
}
