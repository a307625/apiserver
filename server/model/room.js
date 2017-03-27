import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const Schema = mongoose.Schema


// {
//   "profile": {
//     "anchorID": "andreaBaby_1024",
//     "email": "andreababy@gmail.com",
//     "phone": "0981998998",
//     "name": "嫻 AndreaBaby",
//     "description": "不固定時間開播 有緣相遇就追蹤\n快來找我一起玩(love)\n快來當我一輩子的朋友\n\n一月開始開播(love)新手主播\n\nFB粉專：AndreaBaby\nhttps://m.facebook.com/andrea.yours/",
//     "fans": 19751,
//     "imgs": [
//       "https://livebet9457.com/images/92381098.png",
//       "https://livebet9457.com/images/92381128.png",
//       "https://livebet9457.com/images/92381762.png",
//       "https://livebet9457.com/images/92381969.png"
//     ],
//     "mediaUrl": "https://youtu.be/LklRHqfzR7I"
//   }
// }
const roomSchema  = new Schema({
  userID: {
    type: String,
    required: true
  },
  anchorID: {
    type: String
  },
  room: {
    roomID: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    imgUrl: {
      type: String,
      required: true
    },
    streamUrl: {
      type: String,
      required: true
    },
    streamKey: {
      type: String,
      required: true
    }
  },
  begin: {
    type: Number,
    require: true
  },
  end: {
    type: Number
  },
  profit: {
    viewers: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    giftIncome: {
      type: Number,
      default: 0
    },
    stake: {
      type: Number,
      default: 0
    }
  }
})




export default mongoose.model('room', roomSchema)