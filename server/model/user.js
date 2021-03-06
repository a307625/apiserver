import mongoose from 'mongoose'
import bcrypt from 'bcryptjs-then'

mongoose.Promise = global.Promise

const Schema = mongoose.Schema

const userSchema  = new Schema({
  userID: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: 'master_hsiao@gmail.com'
  },
  phone: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: '0'
  },
  hashedpassword: {
    type: String
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 0
  },
  token: {
    type: String
  },
  deviceID: {
    type: String
  },
  credit: {
    currency: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    }
  },
  favorite: {
    type: Array,
    default: null
  }
})

userSchema.virtual('password')
  .set(function(value){
    this.virtualpassword = value
  })
  .get(function(){
    return this.virtualpassword
  })

userSchema.pre('save', async function(next){
  if(!this.password){
    next()
  }

  try {
    this.hashedpassword = await bcrypt.hash(this.password)
    //const check = await bcrypt.compare(this.password, this.hashedPassword)
    next()
  } catch (err) {
    next(err)
  }

})

userSchema.methods.validatePassword = async function(signinpassword){
  try {
    return await bcrypt.compare(signinpassword, this.hashedpassword)
  } catch (err) {
    console.log(err)
    throw err
  }
}


export default mongoose.model('user', userSchema)
