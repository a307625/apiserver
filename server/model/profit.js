import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const Schema = mongoose.Schema


const profitSchema  = new Schema({
  userID: {
    type: String,
    required: true
  },
  anchorID: {
    type: String,
    required: true
  },
  roomID: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  begin: {
    type: Number,
    require: true
  },
  end: {
    type: Number,
    required: true
  },
  profit: {
    viewers: {
      type: Number,
      required: true
    },
    likes: {
      type: Number,
      required: true
    },
    giftIncome: {
      type: Number,
      required: true
    },
    stake: {
      type: Number,
      required: true
    }
  }
})




export default mongoose.model('profit', profitSchema)
