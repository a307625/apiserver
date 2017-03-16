import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'

const validate = (...args) => convert(_validate(...args))
const router = new Router({
  prefix: `/${Config.apiversion}/payment`
})

router.post('/',
  validate({
    // 'nickname:body':['require', 'isAlphanumeric', 'nickname is required/not Alphanumeric'],
  }),
  async(ctx,next)=>{
    try {
      // const {email, nickname, password1, password2} = ctx.request.body
      const userDBInfo = await isUserUniqueSignUp({email})


      ctx.status = 200
      ctx.message = "success"
      ctx.response.body = {
        message: "",
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


router.get('/',
  validate({
    // 'size:query':['require','size is required']
  }),
  async(ctx, next) => {
    try {
      ctx.status = 200
      ctx.response.body = {
        status: "success"
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

export default router
