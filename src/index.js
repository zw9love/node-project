/**
 @author zengwei
 @time 2019/7/27
 **/
const child_process = require('child_process');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const svgCaptcha = require('svg-captcha')
const multipart = require('connect-multiparty')
const multer = require('multer');
const storage = multer.diskStorage({
    // //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        // console.log(file)
        // cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        cb(null, file.originalname)
    }
});
let uploadInfo = multer({storage})
let mysql = require('mysql');
const fs = require('fs');
let data = fs.readFileSync('./config.json')
const databaseData = JSON.parse(data.toString())
let connection = mysql.createConnection(databaseData);


app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname, '../public'))
app.set('view engine', 'html')
app.use(cookieParser())
app.use(bodyParser.json());
app.use('/', express.static('public'));

const multipartMiddleware = multipart()
const urlencodedParser = bodyParser.urlencoded({extended: false}) // 如果前台传递的类型是Form Data类型的数据

// 相当于拦截器，可用于全局检测token
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); //设置允许客户端跨域请求
    res.header("Content-Type", "application/json;charset=UTF-8"); //设置响应头数据类型
    // console.log(111)
    if (req.method === 'POST') {
        // console.log('先进我这')
        // checkToken(req, res, next, o => {
        //     // next()
        //     res.json(getJson('大哥你token呢？', 666))
        // })
        next()
    } else {
        next()
    }
})

// 普通get
app.get('/', function (req, res) {
    res.send('Hello World');
})

/**
 * @api {post} /api/user/submit-login 用户登录
 * @apiDescription 用户登录
 * @apiName submit-login
 * @apiGroup User
 * @apiParam {string} loginName 用户名
 * @apiParam {string} loginPass 密码
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "success" : "true",
 *      "result" : {
 *          "name" : "loginName",
 *          "password" : "loginPass"
 *      }
 *  }
 * @apiSampleRequest http://localhost:3000/api/user/submit-login
 * @apiVersion 1.0.3
 */
// 普通post
app.post('/demo', function (req, res) {
    res.json({code: 200, message: 'hello world', data: req.body});
})

// 接口参数
app.post('/params/:ids', (req, res, next) => {
    res.json({code: 200, message: 'hello world', data: req.params.ids});
})

// 渲染页面
app.get('/login', (request, response, next) => {
    response.setHeader('Content-Type', 'text/html')
    response.render('login')
    // fs.readFile('views/login.html', function (err, data) {
    //     response.writeHead(200, { 'Content-Type': 'text/html' });
    //     response.end(data.toString())
    // })
})

// 测试下载链接
app.get('/testdownload', (request, response, next) => {
    let path = './public/static/images/demo1.jpg'
    response.download(path)
})

// 获取数据库list
app.get('/getlist', (request, response, next) => {
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

// 增加实例
app.post('/add', (request, response, next) => {
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

// 测试验证码
app.post('/captcha', (req, res, next) => {
    let codeConfig = {
        size: 5,// 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        height: 44
    }

    let captcha = svgCaptcha.create(codeConfig)
    // console.log('--------------')
    // console.log(req.session)
    // console.log('--------------')
    // req.session.captcha = captcha.text.toLowerCase(); //存session用于验证接口获取文字码
    let codeData = {
        img: captcha.data,
        msg: captcha.text.toLowerCase()
    }
    res.send(codeData);
})

// 拿到FormData上传的参数
// app.post('/upload', multipartMiddleware, function (request, response, next) {
app.post('/upload', uploadInfo.single('file'), function (request, response, next) {
    console.log(request.body, request.file)
    try {
        response.json({code: 200, message: 'hello world', data: ''});
    } catch (e) {
        response.json({code: 400, message: e, data: ''});
    }
})

// 重定向页面
// app.get('*', (request, response, next) => {
//     // console.log(request.url)
//     response.writeHead(302, {'Location': '/login'})
//     response.end()
// })

// 捕获所有的除了上述路由之外的post请求
app.post('*', (request, response, next) => {
    console.log('post请求：' + request.url)
    next()
})

child_process.exec('apidoc -i src/ -o public/apidoc/', function (error, stdout, stderr) {});


const server = app.listen(8080, function () {

    const host = server.address().address
    const port = server.address().port

    console.log("应用实例，访问地址为 http://localhost:" + port)

})
