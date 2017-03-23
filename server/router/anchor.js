import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'
import User from '../model/user'
import Anchor from '../model/anchor'
import { Token, TokenVerify } from '../utils/token'

const validate = (...args) => convert(_validate(...args))
const router = new Router({
  prefix: `/api/${Config.apiversion}/anchor`
})

//取得主播資訊
router.get('/profile/:anchorID',
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { anchorID } = ctx.params
      const  userID  = await TokenVerify(authorization)
      const anchor = await Anchor.findOne({userID, anchorID})
      if (anchor) {
        const { profile } = anchor
        ctx.status = 200
        ctx.response.body = {
          profile
        }
      }else {
        const UserNotFound = '用戶不存在'
        ctx.status = 404
        ctx.message = "error"
        ctx.response.body = {
          error: UserNotFound
        }
      }
    } catch (err) {
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)

//更新主播資訊
router.post('/profile',
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const  userID_t  = await TokenVerify(authorization)
      const { profile } = ctx.request.body
      const { userID, email, phone, name, description, imgs, mediaUrl } = profile
      const anchor = await Anchor.findOne({'userID': userID_t})
      if (anchor) {
        let status = 1
        if (phone != anchor.profile.phone) {
          status = 0
        }
        await User.findOneAndUpdate({'userID': userID_t}, {
          userID,
          email,
          phone,
          status
        })

        // const { profile } = anchor
        // ctx.status = 200
        // ctx.response.body = {
        //   profile
        // }
      }else {
        const UserNotFound = '用戶不存在'
        ctx.status = 404
        ctx.message = "error"
        ctx.response.body = {
          error: UserNotFound
        }
      }
    } catch (err) {
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)
export default router
