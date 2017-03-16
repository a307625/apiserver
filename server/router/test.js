import Router from 'koa-router'
import convert from 'koa-convert'
import _validate from 'koa-req-validator'
import Test from '../model/test'
import Config from '../config'

const validate = (...args) => convert(_validate(...args))
const router = new Router({
  prefix: `/${Config.apiversion}/test`
})

router.get('/',
  validate({
    'size:query':['require','size is required']
  }),
  async(ctx, next) => {
    try {
      console.log('result')
      const size = ctx.request.query.size
      console.log('size')
      console.log(size)
      const result = await Test.find({size})
      console.log('result')
      console.log(result)
      ctx.status = 200
      ctx.response.body = {
        status: "success"
      }
    } catch (err) {
      console.log('error')
      console.log(err)
      if(err.output.statusCode){
        ctx.throw(err.output.statusCode, err)
      }else {
        ctx.throw(500, err)
      }
    }
  }
)

export default router
