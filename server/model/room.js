import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const Schema = mongoose.Schema

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
  },
  leaders: {
    type: Array,
    default: null
  }
})




export default mongoose.model('room', roomSchema)
