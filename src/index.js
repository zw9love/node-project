/**
 @author zengwei
 @time 2019/7/27
 **/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const svgCaptcha = require('svg-captcha')
const multipart = require('connect-multiparty')
const multer  = require('multer');
const storage = multer.diskStorage({
    // //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        // console.log(file)
        // cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        cb(null, file.originalname)
    }
});
let uploadInfo = multer({ storage })
app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname, '../public'))
app.set('view engine', 'html')
app.use(cookieParser())
app.use(bodyParser.json());
app.use('/static', express.static('public/static'));

const multipartMiddleware = multipart()
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // 如果前台传递的类型是Form Data类型的数据

// 相当于拦截器，可用于全局检测token
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); //设置允许客户端跨域请求
    res.header("Content-Type", "application/json;charset=UTF-8"); //设置响应头数据类型
    // console.log(111)
    if(req.method === 'POST'){
        // console.log('先进我这')
        // checkToken(req, res, next, o => {
        //     // next()
        //     res.json(getJson('大哥你token呢？', 666))
        // })
        next()
    }else{
        next()
    }
})

// 普通get
app.get('/', function (req, res) {
    res.send('Hello World');
})

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
        img:captcha.data,
        msg:captcha.text.toLowerCase()
    }
    res.send(codeData);
})

// 重定向页面
app.get('*', (request, response, next) => {
    // console.log(request.url)
    response.writeHead(302, { 'Location': '/login' })
    response.end()
})

// 捕获所有的除了上述路由之外的post请求
app.post('*', (request, response, next) => {
    console.log('post请求：' + request.url)
    next()
})

const server = app.listen(8080, function () {

    const host = server.address().address
    const port = server.address().port

    console.log("应用实例，访问地址为 http://localhost:" +  port)

})
