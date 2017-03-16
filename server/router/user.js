import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'
import User from '../model/user'
import { Token } from '../utils/token'

const validate = (...args) => convert(_validate(...args))
const router = new Router({
  prefix: `/${Config.apiversion}/user`
})

// router.post('/',
//   validate({
//     'nickname:body':['require', 'isAlphanumeric', 'nickname is required/not Alphanumeric'],
//   }),
//   async(ctx,next)=>{
//     try {
//       const {email, nickname, password1, password2} = ctx.request.body
//       const userDBInfo = await isUserUniqueSignUp({email})
//
//
//       ctx.status = 200
//       ctx.message = "success"
//       ctx.response.body = {
//         message: "",
//       }
//     } catch(err) {
//       if(err.output.statusCode){
//         ctx.throw(err.output.statusCode, err)
//       }else {
//         ctx.throw(500, err)
//       }
//     }
//   }
// )
//
//
// router.get('/',
//   validate({
//     'size:query':['require','size is required']
//   }),
//   async(ctx, next) => {
//     try {
//       ctx.status = 200
//       ctx.response.body = {
//         status: "success"
//       }
//     } catch (err) {
//       if(err.output.statusCode){
//         ctx.throw(err.output.statusCode, err)
//       }else {
//         ctx.throw(500, err)
//       }
//     }
//   }
// )

router.post('/',
  validate({
    'userID:body':['require', 'matches("_")','userID is required/not formatted'],
    'phone:body':['require', 'isMobilePhone("zh-TW")', 'phone is required/not Alphanumeric'],
    'password:body':['require', 'isAlphanumeric', 'password is required/not Alphanumeric'],
  }),
  async(ctx,next)=>{
    try {
      const {userID, phone, password} = ctx.request.body
      const userInfo1 = await User.findOne( { userID } )
      const userInfo2 = await User.findOne( { phone } )
      if(userInfo1 || userInfo2){
        const Conflict = `${userID}已經註冊過了`
        ctx.status = 409
        ctx.message = "error"
        ctx.response.body = {
          error: Conflict
        }
      } else {
        const maxNum = 10000;
        const code = ('0000' + Math.floor(Math.random() * maxNum)).substr(-4)
        let user = new User({...ctx.request.body, code})
        await user.save()
        const { status } = user
        ctx.status = 200
        ctx.message = "success"
        ctx.response.body = {
          userID,
          status
        }
      }
    } catch(err) {
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)

router.post(`/hamburger_4798`,
  validate({
    // 'userID:body':['require', 'matches("_")','userID is required/not formatted'],
    'code:body':['require', 'isAlphanumeric', 'code is required/not Alphanumeric'],
  }),
  async(ctx,next)=>{
    try {
      const userID = 'hamburger_4798'
      const { code } = ctx.request.body
      const userDBInfo = await User.findOneAndUpdate( { code }, {
        status: 1
      } )
      if (userDBInfo) {
        const { userID, status } = userDBInfo
        ctx.status = 200
        ctx.message = "success"
        ctx.response.body = {
          userID,
          status
        }
      } else {
        const NotAcceptable = '錯誤的驗證碼'
        ctx.status = 406
        ctx.message = "error"
        ctx.response.body = {
          error: NotAcceptable
        }
      }
    } catch(err) {
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)

router.post(`/token`,
  validate({
    'userID:body':['require', 'matches("_")','userID is required/not formatted'],
    'password:body':['require', 'isAlphanumeric', 'password is required/not Alphanumeric'],
  }),
  async(ctx,next)=>{
    try {
      const { userID, password } = ctx.request.body
      const user = await User.findOne({ userID })
      if (user) {
        if (user.status) {
          const check = await user.validatePassword( password )
          if (check) {
            const token = await Token( userID )
            ctx.status = 200
            ctx.message = "success"
            ctx.response.body = {
              token
            }
          } else {
            ctx.status = 400
            ctx.message = "error"
            ctx.response.body = {
              error: '密碼錯誤'
            }
          }
        } else {
          const Unauthorized = '尚未驗證行動電話'
          ctx.status = 401
          ctx.message = "error"
          ctx.response.body = {
            error: Unauthorized
          }
        }
      } else {
        const UserNotFound = '用戶不存在'
        ctx.status = 404
        ctx.message = "error"
        ctx.response.body = {
          error: UserNotFound
        }
      }
    } catch(err) {
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)
export default router
