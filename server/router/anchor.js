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
      const anchor = await Anchor.findOne({anchorID})
      const user = await User.findOne({userID})
      if (anchor && user) {
        const { email, phone, name, description, fans, imgs, mediaUrl } = anchor
        ctx.status = 200
        ctx.response.body = {
          'profile':{
            anchorID, email, phone, name, description, fans, imgs, mediaUrl
          }
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
      const UserNotFound = '用戶不存在'
      ctx.status = 404
      ctx.message = "error"
      ctx.response.body = {
        error: UserNotFound
      }
      // if(err.output.statusCode){
      //   ctx.throw(err.output.statusCode, err)
      // }else {
      //   ctx.throw(500, err)
      // }
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
      if (profile){
        let userID_r= profile.userID
        let email_r = profile.email
        let phone_r = profile.phone
        const anchor = await Anchor.findOne({'userID': userID_t})
        if (anchor) {
          let other_user = await User.findOne( { 'userID': userID_r } )
          let re = /[_]{1}/
          const check = re.test(userID_r)
          if (userID_r && (other_user || (!check))) {
            const NotAcceptable = '資料有誤，userID的格式不正確/userID重複'
            ctx.status = 406
            ctx.message = "error"
            ctx.response.body = {
              error: NotAcceptable
            }
          }else {
            await anchor.update({
              ...profile
            })
            if (userID_r || email_r || phone_r) {
              const user = await User.find({'userID': userID_t})
              let { token, code } = user
              if(userID_r) {
                token = await Token( userID_r )
              }
              let status = 1
              if ( phone_r != (anchor.phone) ) {
                status = 0
                const maxNum = 10000
                code = ('0000' + Math.floor(Math.random() * maxNum)).substr(-4)
              }
              await User.findOneAndUpdate({'userID': userID_t}, {
                ...profile,
                token,
                code,
                status
              })
            }
            const { _id } = anchor
            const { anchorID, email, phone, name, description, fans, imgs, mediaUrl } = await Anchor.findOne( { _id } )
            ctx.status = 200
            ctx.response.body = {
              'profile':{
                anchorID,
                email,
                phone,
                name,
                description,
                fans,
                imgs,
                mediaUrl
              }
            }
          }
        }else {
          const UserNotFound = '用戶不存在'
          ctx.status = 404
          ctx.message = "error"
          ctx.response.body = {
            error: UserNotFound
          }
        }
      }
    } catch (err) {
      const UserNotFound = '用戶不存在'
      ctx.status = 404
      ctx.message = "error"
      ctx.response.body = {
        error: UserNotFound
      }
      // if(err.output.statusCode){
      //   ctx.throw(err.output.statusCode, err)
      // }else {
      //   ctx.throw(500, err)
      // }
    }
  }
)

//取得追蹤主播清單
router.get('/favor',
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne( { userID } )
      const anchor = await Anchor.find( { } )
      let favor = []
      if (user) {
        anchor.forEach((value)=>{
          const { anchorID, email, phone, name, description, fans, imgs, mediaUrl } = value
          let obj = { anchorID, email, phone, name, description, fans, imgs, mediaUrl }
          favor.push(obj)
        })
        ctx.status = 200
        ctx.response.body = {
          favor
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
      const UserNotFound = '用戶不存在'
      ctx.status = 404
      ctx.message = "error"
      ctx.response.body = {
        error: UserNotFound
      }
      // if(err.output.statusCode){
      //   ctx.throw(err.output.statusCode, err)
      // }else {
      //   ctx.throw(500, err)
      // }
    }
  }
)

router.put('/:anchorID/favor',
  validate({
      'isFavorite:body':['require', 'isBoolean', 'isFavorite is required/not Boolean'],
    }),
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { isFavorite } = ctx.request.body
      const { anchorID } = ctx.params
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne( { userID } )
      const anchor = await Anchor.findOne( { anchorID } )
      if (user && anchor) {
        if (isFavorite) {
          let favorite = []
          favorite.push(anchorID)
          await user.update({ favorite })
          ctx.status = 200
          ctx.response.body = {
            isFavorite
          }
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
      const UserNotFound = '用戶不存在'
      ctx.status = 404
      ctx.message = "error"
      ctx.response.body = {
        error: UserNotFound
      }
      // if(err.output.statusCode){
      //   ctx.throw(err.output.statusCode, err)
      // }else {
      //   ctx.throw(500, err)
      // }
    }
  }
)

export default router
