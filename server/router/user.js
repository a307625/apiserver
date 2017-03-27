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
  prefix: `/api/${Config.apiversion}/user`
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


//新增用戶
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
        const maxNum = 10000
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

//取得用戶token
router.post('/token',
  validate({
    'userID:body':['require', 'matches("_")','userID is required/not formatted'],
    'password:body':['require', 'isAlphanumeric', 'password is required/not Alphanumeric'],
    'deviceID:body':['require', 'isAlphanumeric', 'deviceID is required/not Alphanumeric']
  }),
  async(ctx, next)=>{
    try {
      const { userID, password, deviceID } = ctx.request.body
      const user = await User.findOne({ userID })
      if (user) {
        if (user.status) {
          const check = await user.validatePassword( password )
          if (check) {
            const token = await Token( userID )
            await user.update({
                token,
                deviceID
            })
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

//認證用戶
router.post('/auth/:userID',
  validate({
    'userID:params':['require', 'matches("_")','userID is required/not formatted'],
    'code:body':['require', 'isAlphanumeric', 'code is required/not Alphanumeric'],
  }),
  async(ctx, next)=>{
    try {
      const { userID } = ctx.params
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

//取得用戶資訊
router.get('/profile',
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const { email, phone, type} = user
        ctx.status = 200
        ctx.response.body = {
          profile: {
            userID,
            email,
            phone,
            type
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

//更新用戶資訊
router.post('/profile',
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const userID_t = await TokenVerify(authorization)
      const userID_req = ctx.request.body.userID
      const phone_req = ctx.request.body.phone
      const email_req = ctx.request.body.email
      let user = await User.findOne( { 'userID': userID_t } )
      if (user) {
        let { token, code} = user
        let other_user = await User.findOne( { 'userID': userID_req } )
        let re = /[_]{1}/
        const check = re.test(userID_req)
        if (userID_req && (other_user || (!check))) {
          const NotAcceptable = '資料有誤，userID的格式不正確/userID重複'
          ctx.status = 406
          ctx.message = "error"
          ctx.response.body = {
            error: NotAcceptable
          }
        }else {
          if( userID_req || phone_req || email_req ){
            if(userID_req) {
              token = await Token( userID_req )
            }
            let status = 1
            console.log(phone_req)
            console.log(user.phone)
            if (phone_req != (user.phone)) {
              status = 0
              const maxNum = 10000
              code = ('0000' + Math.floor(Math.random() * maxNum)).substr(-4)
            }
            await user.update({
              ...ctx.request.body,
              token,
              code,
              status
            })
            if( user.type ) {
              const anchor = await Anchor.findOneAndUpdate ( { userID: userID_t}, {
                ...ctx.request.body
              })
            }
          }
          const { _id } = user
          const {userID, email, phone, type} = await User.findOne( { _id } )
          ctx.status = 200
          ctx.response.body = {
            profile: {
              userID,
              email,
              phone,
              type
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

//取得用戶餘額
router.get('/credit',
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const userID = await TokenVerify(authorization)
      const { credit } = await User.findOne({userID})
      if (credit) {
        ctx.status = 200
        ctx.response.body = {
          credit
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

//普通用戶申請成為主播
router.post('/anchor',
  // validate({
  //   'name:body':['require', 'notEmpty()','name is required/not formatted'],
  //   'description:body':['notEmpty()', 'notEmpty', 'description is required/not Alphanumeric'],
  //   'imgs:body':['require', 'notEmpty()', 'description is required/not Alphanumeric'],
  //   'mediaUrl:body':['require', 'notEmpty()', 'description is required/not Alphanumeric'],
  // }),
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      // const { name, description, imgs, mediaUrl} = ctx.request.body
      const { anchorID } = ctx.request.body
      const userID = await TokenVerify(authorization)
      const userInfo = await User.findOne({userID})
      const { email, phone, token, deviceID} = userInfo
      let exist_u = await Anchor.findOne({userID})
      let exist_a = await Anchor.findOne({anchorID})
      if (userInfo) {
        if (exist_u || exist_a) {
          const Conflict = `${userID}/${anchorID}已經註冊過了`
          ctx.status = 409
          ctx.message = "error"
          ctx.response.body = {
            error: Conflict
          }
        }else {
          let anchor = new Anchor({
            userID,
            anchorID,
            deviceID,
            email,
            phone,
            ...ctx.request.body    　
          })
          console.log(anchor)
          await anchor.save()
          await User.findOneAndUpdate( { userID }, {
            type : 1
          } )
          ctx.status = 200
          ctx.response.body = {
            anchor
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
