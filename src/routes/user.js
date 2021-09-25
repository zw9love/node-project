let express = require('express');
let router = express.Router();
let mysql = require('mysql');
const fs = require('fs');
let data = fs.readFileSync('./config.json')
const databaseData = JSON.parse(data.toString())
// let connection = mysql.createConnection(databaseData);
let {execTrans, _getNewSqlParamEntity, execQuery, execPaginationQuery} = require('../utils/dbHelper')
let {getJson} = require('../utils/index')

/**
 * @api {get} /user/getList 获取用户列表
 * @apiDescription 获取用户列表
 * @apiName /user/getList
 * @apiGroup user
 * @apiParam {string} name='' 用户名
 * @apiParam {string} passwd='' 密码
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/user/getList
 * @apiVersion 1.0.0
 */

// 获取数据库list
router.get('/getList', (request, response, next) => {
    let sql = 'SELECT * FROM user';
    execQuery(sql).then((result) => {
        response.json({code: 200, message: 'hello world', data: result});
    }).catch((error) => {
        response.json({code: 400, message: error, data: {}});
    })
})

/**
 * @api {post} /user/add 增加用户
 * @apiDescription 增加用户
 * @apiName /user/add
 * @apiGroup user
 * @apiParam {string} name='' 用户名
 * @apiParam {string} age=0 年龄
 * @apiParam {string} money=0 年龄
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/user/add
 * @apiVersion 1.0.0
 */
// 增加实例
router.post('/add', (request, response, next) => {
    let {name, age, money} = request.body
    let sql = 'INSERT INTO user(name,age, money) VALUES(?,?,?)';
    let sqlParams = [name || '', age || '0', money || 0]
    execQuery(sql, sqlParams).then((result) => {
        response.json(null);
    }).catch((error) => {
        response.json({code: 400, message: error, data: {}});
    })
})


/**
 * @api {post} /user/transaction 测试事务
 * @apiDescription 测试事务
 * @apiName /transaction
 * @apiGroup user
 * @apiParam {number} money=0 转钱数值
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": ""
 }
 * @apiSampleRequest http://localhost:8080/user/transaction
 * @apiVersion 1.0.0
 */
// 增加实例
router.post('/transaction', (request, response, next) => {
    let {money} = request.body
    let sql1 = 'UPDATE  user SET money = money - ?  WHERE id = 1';
    let sql2 = 'UPDATE  user SET money = money + ? WHERE id = 2';
    let sqlParams = [Number(money) || 0]

    let sqlParamsEntity = [];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1, sqlParams));
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2, sqlParams));

    execTrans(sqlParamsEntity).then(() =>{
        response.json({code: 200, message: '执行成功！', data: ''});
    }).catch((err) => {
        response.json({code: 400, message: err, data: ''});
    })
})


/**
 * @api {get} /user/pagination 测试分页
 * @apiDescription 测试分页
 * @apiName /pagination
 * @apiGroup user
 * @apiParam {number} pageNumber=1 第几页
 * @apiParam {number} pageSize=10 每页多少条数据
 * @apiSuccess {json} data 返回值
 * @apiSuccessExample {json} Success-Response:
 {
     "code": 200,
     "message": "hello world",
     "data": {}
 }
 * @apiSampleRequest http://localhost:8080/user/pagination
 * @apiVersion 1.0.0
 */
router.get('/pagination', function (req, res, next) {
    console.log('req.query', req.query)
    let select = 'SELECT * FROM user'
    execPaginationQuery(req, res, 'user', select)
});

module.exports = router;
