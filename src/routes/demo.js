let express = require('express');
let router = express.Router();

/*
 * @apiHeader {String} Content-Type=application/json;charset=utf-8 请求内容类型
 * @apiHeader {String} Content-Type=application/x-www-form-urlencoded;charset=UTF-8 请求内容类型
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Content-Type": "application/json; charset=utf-8",
 *       "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
 *     }
*/

/**
 * @api {get} /demo 测试
 * @apiDescription 测试
 * @apiName demo
 * @apiGroup demo
 * @apiParam {string} name=xxx 用户名
 * @apiParam {string} passwd=123 密码
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/demo
 * @apiVersion 1.0.0
 */
// 普通get
router.get('/demo', function (req, res) {
    res.json({code: 200, message: 'hello world', data: req.body});
})

/**
 * @api {post} /demo 测试
 * @apiDescription 测试
 * @apiName demo
 * @apiGroup demo
 * @apiParam {string} name=xxx 用户名
 * @apiParam {string} passwd=123 密码
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/demo
 * @apiVersion 1.0.0
 */
// 普通post
router.post('/demo', function (req, res) {
    res.json({code: 200, message: 'hello world', data: req.body});
})


/**
 * @api {post} /demo/:id/:name 测试接口带参数id
 * @apiDescription 测试接口带参数id
 * @apiName /demo/:ids
 * @apiGroup demo
 * @apiParam {Number} id id值.
 * @apiParam {String} name name值.
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/demo/:id/:name
 * @apiVersion 1.0.0
 */
// 接口参数
router.post('/demo/:ids/:name', (req, res, next) => {
    res.json({code: 200, message: 'hello world', data: {id: req.params.ids, name: req.params.name}});
})


/**
 * @api {post} /demo/addHeader 测试添加请求头
 * @apiDescription 测试添加请求头
 * @apiName 测试添加请求头
 * @apiGroup demo
 * @apiHeader {String} token 请求头token值
 * @apiParam {string} name=xxx 用户名
 * @apiParam {string} passwd=123 密码
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": 'xxx'
 }
 * @apiSampleRequest http://localhost:8080/demo/addHeader
 * @apiVersion 1.0.0
 */
// 普通post
router.post('/demo/addHeader', function (req, res) {
    res.json({code: 200, message: 'hello world', data: req.headers.token});
})

module.exports = router;