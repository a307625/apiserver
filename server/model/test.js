import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const Schema = mongoose.Schema

const testSchema  = new Schema({
  size: {
    type: String
  }
})


export default mongoose.model('test', testSchema)
