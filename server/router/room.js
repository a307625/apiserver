import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'
import User from '../model/user'
import Anchor from '../model/anchor'
import Room from '../model/room'
import Profit from '../model/profit'
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
        const maxNum = 1000000
        const code = ('000000' + Math.floor(Math.random() * maxNum)).substr(-6)
        const roomID = "rn"+code//不該重複, 先放著之後再做檢查functoin
        //get status from media server
        const status = 1
        const d = new Date()
        const begin = d.getTime()
        if (status) {
          const exist = await Room.findOne( { userID } )
          const { anchorID } = await Anchor.findOne( { userID } )
          if (exist) {
            await Room.findOneAndUpdate( { userID },{
              userID,
              anchorID,
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
              },
              leaders: []
            })
          }else {
            let room = new Room({
              userID,
              anchorID,
              room:{
                roomID,
                title,
                imgUrl,
                streamUrl,
                streamKey
              },
              begin,
              end: 0
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
      const user = await Room.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if ( room && room.end == 0 ) { // room.end == 0 =>  room still open
          const { anchorID, begin, profit } = room
          const { roomID, title } = room.room
          const d = new Date()
          const end = d.getTime()
          await room.update({end})

          let profit_ = new Profit({
            userID, anchorID, roomID, title, begin, end, profit })
          profit_.save()
          //when close, record and save the profit into the profit DB

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

//加入直播間
router.post('/:roomID/join',
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { roomID } = ctx.params
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if ( room && room.end == 0) {// room.end == 0 =>  room still open
          const { anchorID, begin, profit } = room
          let { viewers } = profit
          const { streamUrl, title } = room.room
          let { name, imgs, fans, likes } = await Anchor.findOne({ anchorID })
          viewers++
          await room.update({
            'profit.viewers': viewers
          })
          ctx.status = 200
          ctx.response.body = {
            streamUri:streamUrl,
            backupUri:streamUrl,
            announcement: title,
            host:{
              hostID: anchorID,
              hostName: name,
              hostImg: imgs,
              fans,
              likes
            }
          }
        }else {
          const NotFound = '直播間不存在'
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

//離開直播間
router.post('/:roomID/leave',
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { roomID } = ctx.params
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if ( room && room.end == 0) {// room.end == 0 =>  room still open
          const { anchorID, begin, profit } = room
          let { viewers } = profit
          const { roomID } = room.room

          viewers--
          await room.update({
            'profit.viewers': viewers
          })
          ctx.status = 200
          ctx.response.body = {
          }
        }else {
          const NotFound = '直播間不存在'
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

//傳送訊息
router.post('/:roomID/message',
  validate({
    'body:body':['require','body is required'],
    'time:body':['require', 'isDecimal', 'time is required'],
  }),
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { roomID } = ctx.params
      const { body, time } = ctx.request.body
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if ( room && room.end == 0) {// room.end == 0 =>  room still open
          ctx.status = 200
          ctx.response.body = {
          }
        }else {
          const NotFound = '直播間不存在'
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


//送禮排行榜
router.post('/:roomID/leaderboard',
  async (ctx, next) => {
    try {
      const { authorization, deviceid} = ctx.request.header
      const { roomID } = ctx.params
      const { body, time } = ctx.request.body
      const  userID  = await TokenVerify(authorization)
      const user = await User.findOne({userID})
      if (user) {
        const room = await Room.findOne({'room.roomID' : roomID})
        if ( room && room.end == 0) {// room.end == 0 =>  room still open
          // const { leaders } = room
          // leaders.forEach( ( val ) => {
          //
          // })
          ctx.status = 200
          ctx.response.body = {
            "leaders": [
              {
                "userID": "aac_1224",
                "totalGift": 32097,
                "ranking": 1
              },
              {
                "userID": "w918_ma",
                "totalGift": 24578,
                "ranking": 2
              },
              {
                "userID": "john9808",
                "totalGift": 22001,
                "ranking": 3
              }
            ]
          }
        }else {
          const NotFound = '直播間不存在'
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

export default router
