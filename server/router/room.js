import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'
import User from '../model/user'
import Anchor from '../model/anchor'
import Room from '../model/room'
import { Token, TokenVerify } from '../utils/token'

const validate = (...args) => convert(_validate(...args))
const router = new Router({
  prefix: `/api/${Config.apiversion}/room`
})

//建立直播間
router.post('/new',
  validate({
      'title:body':['require',  'title is required'],
      'image:body':['require', 'isBase64', 'image is required'],
    }),
  async(ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const {title, image} = ctx.request.body
      const userID = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        //image decoded and save to img folder and get imgUrl
        //get streamUrl
        //get streamKey
        //asign roomID
        const imgUrl = "https://livebet9457.com/images/92801371.png"
        const streamUrl = "rtmp://livebet9457.com/live"
        const streamKey = "QiLCJhbGciO"
        const roomID = "rn172094"
        //get status from media server
        const status = 1
        const d = new Date()
        const begin = d.getTime()
        if (status) {
          const exist = await Room.findOne( { userID } )
          if (exist) {
            await Room.findOneAndUpdate( { userID },{
              userID,
              room:{
                roomID,
                title,
                imgUrl,
                streamUrl,
                streamKey
              },
              begin,
              end: 0,
              profit: {
                viewers:0,
                likes: 0,
                giftIncome:0,
                stake: 0
              }
            })
          }else {
            let room = new Room({
              userID,
              room:{
                roomID,
                title,
                imgUrl,
                streamUrl,
                streamKey
              },
              begin
            })
            await room.save()
          }
          ctx.status = 200
          ctx.response.body = {
            roomID,
            title,
            imgUrl,
            streamUrl,
            streamKey,
            begin
          }
        }else {
          const NotAcceptable = '直播建立失敗 - 媒體伺服器無回應'
          ctx.status = 406
          ctx.message = "error"
          ctx.response.body = {
            error: NotAcceptable
          }
        }
      }else {
        const Unauthorized = '未授權的用戶'
        ctx.status = 401
        ctx.message = "error"
        ctx.response.body = {
          error: Unauthorized
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

//關閉直播間
router.post('/:roomID/close',
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { roomID } = ctx.params
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if (room) {
          const { begin, profit } = room
          const { roomID, title } = room.room
          const d = new Date()
          const end = d.getTime()
          await room.update({end})
          ctx.status = 200
          ctx.response.body = {
            roomID,
            title,
            begin,
            end,
            profit
          }
        }else {
          const NotFound = '錯誤的直播間ID'
          ctx.status = 404
          ctx.message = "error"
          ctx.response.body = {
            error: NotFound
          }
        }
      }else {
        const Unauthorized = '未授權的用戶'
        ctx.status = 401
        ctx.message = "error"
        ctx.response.body = {
          error: Unauthorized
        }
      }
    } catch (err) {
      const Unauthorized = '未授權的用戶'
      ctx.status = 401
      ctx.message = "error"
      ctx.response.body = {
        error: Unauthorized
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
// router.get('/favor',
//   async(ctx, next) => {
//     try {
//       const { authorization, deviceid} = ctx.request.header
//       const  userID  = await TokenVerify(authorization)
//       const user = await User.findOne( { userID } )
//       const anchor = await Anchor.find( { } )
//       let favor = []
//       if (user) {
//         anchor.forEach((value)=>{
//           const { anchorID, email, phone, name, description, fans, imgs, mediaUrl } = value
//           let obj = { anchorID, email, phone, name, description, fans, imgs, mediaUrl }
//           favor.push(obj)
//         })
//         ctx.status = 200
//         ctx.response.body = {
//           favor
//         }
//       }else {
//         const UserNotFound = '用戶不存在'
//         ctx.status = 404
//         ctx.message = "error"
//         ctx.response.body = {
//           error: UserNotFound
//         }
//       }
//     } catch (err) {
//       const Unauthorized = '未授權的用戶'
//       ctx.status = 401
//       ctx.message = "error"
//       ctx.response.body = {
//         error: Unauthorized
//       }
//       // if(err.output.statusCode){
//       //   ctx.throw(err.output.statusCode, err)
//       // }else {
//       //   ctx.throw(500, err)
//       // }
//     }
//   }
// )
//
// router.put('/:anchorID/favor',
//   validate({
//       'isFavorite:body':['require', 'isBoolean', 'isFavorite is required/not Boolean'],
//     }),
//   async(ctx, next) => {
//     try {
//       const { authorization, deviceid} = ctx.request.header
//       const { isFavorite } = ctx.request.body
//       const { anchorID } = ctx.params
//       const  userID  = await TokenVerify(authorization)
//       const user = await User.findOne( { userID } )
//       const anchor = await Anchor.findOne( { anchorID } )
//       if (user && anchor) {
//         if (isFavorite) {
//           let favorite = []
//           favorite.push(anchorID)
//           await user.update({ favorite })
//           ctx.status = 200
//           ctx.response.body = {
//             isFavorite
//           }
//         }
//       }else {
//         const UserNotFound = '用戶不存在'
//         ctx.status = 404
//         ctx.message = "error"
//         ctx.response.body = {
//           error: UserNotFound
//         }
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

export default router
