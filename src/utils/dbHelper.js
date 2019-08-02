let mysql = require('mysql');
let async = require("async");
let mysqlOptions = require("../../config")

let pool = mysql.createPool(mysqlOptions);

function _getNewSqlParamEntity(sql, params, callback) {
    if (callback) {
        return callback(null, {
            sql: sql,
            params: params
        });
    }
    return {
        sql: sql,
        params: params
    };
}

function execTrans(sqlparamsEntities) {
    return new Promise(function(resolve, reject){
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    return reject(err);
                }
                console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
                let funcAry = [];
                sqlparamsEntities.forEach(function (sql_param) {
                    let temp = function (cb) {
                        let sql = sql_param.sql;
                        let param = sql_param.params;
                        connection.query(sql, param, function (tErr, rows, fields) {
                            if (tErr) {
                                connection.rollback(function () {
                                    console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                    throw tErr;
                                });
                            } else {
                                return cb(null, rows);
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    // console.log("transaction error: " + err);
                    if (err) {
                        connection.rollback(function (err) {
                            console.log("transaction error: " + err);
                            connection.release();
                            return reject(err);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            // console.log("transaction info: " + JSON.stringify(info));
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    return reject(err);
                                });
                            } else {
                                connection.release();
                                return resolve(result);
                            }
                        })
                    }
                })
            });
        });
    })

}

function execPaginationQuery(req, res, tableName, select, where = ' ') {
    let current_page = 1; //默认为1
    let {pageNumber, pageSize} = req.query
    pageNumber = parseInt(pageNumber)
    if (pageNumber) {
        current_page = pageNumber;
    }
    let num = parseInt(pageSize) || 10; //一页条数
    let last_page = current_page - 1;
    if (current_page <= 1) {
        last_page = 1;
    }
    let next_page = current_page + 1;
    // let sql1 = 'SELECT * FROM user limit ' + num + ' offset ' + num * (current_page - 1); // limit和offset
    let sql1 = select + where + ' limit ' + num * (current_page - 1) + ', ' + num + ';'; // limit
    let sql2 = 'select count(*) as total from ' + tableName;
    let sqlParamsEntity = [];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1, []));
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2, []));
    execTrans(sqlParamsEntity).then(result =>{
        let list = result[0]
        let total = result[1][0].total
        res.json({code: 200, message: '执行成功！', data: {last_page: last_page, next_page: next_page, current_page: current_page, list: list || [], total}});
    }).catch((err) => {
        res.json({code: 400, message: err, data: ''});
    })
}

function execQuery(sql, params = []) {
    return new Promise(function(resolve, reject){
        //做一些异步操作
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            }
            connection.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }else{
                    resolve(result)
                }
            });
            connection.release();
        });
    });
}

module.exports = {
    execTrans,
    _getNewSqlParamEntity,
    execQuery,
    execPaginationQuery
}