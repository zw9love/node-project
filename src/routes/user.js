let express = require('express');
let router = express.Router();
let mysql = require('mysql');
const fs = require('fs');
let data = fs.readFileSync('./config.json')
const databaseData = JSON.parse(data.toString())
let connection = mysql.createConnection(databaseData);
const async = require('async');
let {execTrans, _getNewSqlParamEntity} = require('../utils/dbHelper')
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


/**
 * @api {post} /transaction 测试事务
 * @apiDescription 测试事务
 * @apiName /transaction
 * @apiGroup user
 * @apiParam {number} money=1 转钱数值
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
    connection.connect();
    let {money} = request.body
    let sql1 = 'UPDATE  user SET money = money - ?  WHERE id = 1';
    let sql2 = 'UPDATE  user SET money = money + ? WHERE id = 2';
    let sqlParams = [money]

    let sqlParamsEntity = [];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1, sqlParams));
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2, sqlParams));

    execTrans(sqlParamsEntity, function(err, info){
        if(err){
            console.error("事务执行失败");
            console.error(err);
        }else{
            response.json({code: 200, message: 'hello world', data: ''});
            console.log("done.");
        }
    })

})


// 分页
// router.get('/pagination', function(req, res, next) {
//     let current_page = 1; //默认为1
//     let num = 9; //一页条数
//     if (req.query.page) {
//         current_page = parseInt(req.query.page);
//     }
//
//     let last_page = current_page - 1;
//     if (current_page <= 1) {
//         last_page = 1;
//     }
//     let next_page = current_page + 1;
//     let str = 'SELECT left(paragraph,50) as paragraph,date,id FROM notice limit ' + num + ' offset ' + num * (current_page - 1);
//     let conn = mysql.createConnection(settings.db);
//
//     conn.connect();
//     conn.query(str, function(err, rows, fields) {
//         if (err) {
//             req.flash('error', '数据查询有误');
//         }
//         if (!err) {
//             if (!rows[0]) {
//                 req.flash('error', '已到最后一页,请返回');
//             }
//             res.render('notice', {
//                 last_page: last_page,
//                 next_page: next_page,
//                 current_page: current_page,
//                 mes: rows,
//                 error: req.flash('error').toString()
//             });
//
//         }
//     });
//     conn.end();
// });

module.exports = router;