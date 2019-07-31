let express = require('express');
let router = express.Router();
let mysql = require('mysql');
const fs = require('fs');
let data = fs.readFileSync('./config.json')
const databaseData = JSON.parse(data.toString())
let connection = mysql.createConnection(databaseData);

/**
 * @api {get} /user/getList 获取用户列表
 * @apiDescription 获取用户列表
 * @apiName /user/getList
 * @apiGroup user
 * @apiParam {string} name=xxx 用户名
 * @apiParam {string} passwd=123 密码
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
    connection.connect();
    let sql = 'SELECT * FROM user';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        response.json({code: 200, message: 'hello world', data: result});
        console.log('------------------------------------------------------------\n\n');
    });
    connection.end();
})

/**
 * @api {post} /user/add 增加用户
 * @apiDescription 增加用户
 * @apiName /user/add
 * @apiGroup user
 * @apiParam {number} id=1 id
 * @apiParam {string} name=xxx 用户名
 * @apiParam {string} age=123 年龄
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
    connection.connect();
    let {name, age, id} = request.body
    let sql = 'INSERT INTO user(id,name,age) VALUES(?,?,?)';
    let sqlParams = [id || 0, name || '', age || '0']
    console.log(sqlParams)
    connection.query(sql, sqlParams, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            next()
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        response.json({code: 200, message: 'hello world', data: ''});
        console.log('------------------------------------------------------------\n\n');
    });
    connection.end();
})

module.exports = router;