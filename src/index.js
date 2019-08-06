/**
 @author zengwei
 @time 2019/7/27
 **/
let {sendMail, getRandomString, aesEncrypt, aesDecrypt} = require('./utils/index.js')
let {getData, postData} = require('./utils/http.js')
const redis = require("redis");
const client = redis.createClient();
// client.on("error", function (err) {
//     console.log("Error " + err);
// });
//
// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });

const md5 = require('blueimp-md5')
const child_process = require('child_process');
const express = require('express');
const app = express();
const session = require('express-session')
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


const urlencodedParser = bodyParser.urlencoded({extended: false}) // 如果前台传递的类型是Form Data类型的数据，Content-Type=application/x-www-form-urlencoded;charset=UTF-8 请求内容类型
const jsonParser = bodyParser.json() // Content-Type=application/json;charset=utf-8 请求内容类型

app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname, '../public'))
app.set('view engine', 'html')
app.use(cookieParser())
app.use(urlencodedParser);
app.use('/', express.static('public'));

const multipartMiddleware = multipart()

// 路由
const demoRouter = require('./routes/demo');
const userRouter = require('./routes/user');



// 相当于拦截器，可用于全局检测token
app.all("*", (req, res, next) => {
    // res.header("Access-Control-Allow-Origin", "*"); //设置允许客户端跨域请求
    res.header("Content-Type", "application/json;charset=UTF-8"); //设置响应头数据类型
    // console.log(req.method)
    if (req.method === 'POST') {
        // console.log('先进我这')
        // if(!req.headers.token){
        //     res.json({code: 606, message: '大哥你token呢？111', data: ''})
        // }
        next()
    } else {
        next()
    }
})

app.use('/', demoRouter);
app.use('/user', userRouter);
app.use(session({
    secret: '123456',
    name: 'node',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 5 * 60 * 1000, secure: false },  //设置过期时间，session和相应的cookie失效过期
    resave: false, // 关键配置，让每个用户的session互不干扰
    saveUninitialized: true, // 是否自动保存未初始化的会话，建议false
    // store: new RedisStore(this.storeOption)
}));



// // 普通get
app.post('/login', (req, res, next) => {
    // console.log(req)
    let name = req.body.name
    let password = req.body.password
    // console.log('name = ' + name)
    // console.log('password = ' + password)
    if(name === 'admin' && password === 'admin'){
        // 重新生成session，sessionID自然也变了
        req.session.regenerate(function(err) {
            if(err) return res.json({ret_code: 2, ret_msg: '登录失败'});
            req.session.loginUser = 'admin'
            res.json({status: 200, data: null, msg: '成功'});
        })
    }else{
        res.json({status: 606, data: null, msg: '用户名或密码错误'});
    }
})

// 渲染页面
app.get('/login', (request, response, next) => {
    response.setHeader('Content-Type', 'text/html')
    response.render('view/login')
    // fs.readFile('views/login.html', function (err, data) {
    //     response.writeHead(200, { 'Content-Type': 'text/html' });
    //     response.end(data.toString())
    // })
})

// 渲染页面
app.get('/loged', (req, res, next) => {

    if(req.session.loginUser){
        req.session.views++
        let loginUser = req.session.loginUser
        let isLogined = loginUser
        res.setHeader('Content-Type', 'text/html')
        res.render('view/loged', {
            isLogined: isLogined,
            name: loginUser || ''
        })
    }else{
        req.session.views = 1
        // res.setHeader('Content-Type', 'text/html')
        // res.redirect('/login')
        let loginUser = req.session.loginUser
        let isLogined = loginUser
        res.setHeader('Content-Type', 'text/html')
        res.render('view/loged', {
            isLogined: isLogined,
            name: loginUser || ''
        })
    }
})

// 退出登录
app.get('/logout', function(req, res, next){
    // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
    // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
    // 然后去查找对应的 session 文件，报错
    // session-file-store 本身的bug
    req.session.destroy(function(err) {
        if(err){
            res.json({ret_code: 2, ret_msg: '退出登录失败'});
            return;
        }
        // req.session.loginUser = null;
        // res.clearCookie(identityKey);
        res.redirect('/login');
    });
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

// 发邮件
app.get('/sendMail', (request, response, next) => {
    sendMail({
        recipient:'18514075699@163.com,823334587@qq.com',
        title:'圣诞大礼哦，点进来看看啊111',
        text:'圣诞快乐，有附件。111',
        name: '你大爷'
        // html:'<h1>Hi, weiwei,这是一封测试邮件111222333</h1>'
        // files:[
        //     {
        //         filename:'config.json',
        //         path:'./src/dao/config.json' // 当前路径是项目根路径
        //     },
        //     {
        //         filename:'index.ts',
        //         path:'./src/dao/index.ts'
        //     }
        // ]
    })
    response.json({code: 200, message:"发送成功", data: ''})
})

// 随机字符串
app.get('/getRandomString', (request, response, next) => {
    response.json({code: 200, message:"成功", data: getRandomString()})
})

// md5
app.get('/getMd5', (request, response, next) => {
    response.json({code: 200, message:"成功", data: md5('123456', 'weiwei')})
})

// 加密
app.get('/aesEncrypt', (request, response, next) => {
    response.json({code: 200, message:"成功", data: aesEncrypt('123')})
})

// 解密
app.get('/aesDecrypt', (request, response, next) => {
    response.json({code: 200, message:"成功", data: aesDecrypt(aesEncrypt('123'))})
})

// http的get请求
app.get('/getHttpData', function(req, res) {
    // http模块获取其他服务器数据
    getData('/user/pagination', req.query).then(data => {
        res.json({code: 200, message:"成功", data: data})
    }).catch(e => {
        res.json({code: 400, message:"失败", data: e.toString()})
    })
});

// http的post请求
app.post('/postHttpData', function(req, res) {
    // http模块获取其他服务器数据
    postData('/user/add', req.body).then(data => {
        res.json({code: 200, message:"成功", data: data})
    }).catch(e => {
        res.json({code: 400, message:"失败", data: e.toString()})
    })
});

// 重定向页面
app.get('*', (request, response, next) => {
    // console.log(request.url)
    response.writeHead(302, {'Location': '/login'})
    response.end()
})

// 捕获所有的除了上述路由之外的post请求
app.post('*', (request, response, next) => {
    console.log('post请求：' + request.url)
    response.json({code: 404, message:"Can not find it", data: ''})
    next()
})


child_process.exec('apidoc -i src/ -o public/apidoc/', function (error, stdout, stderr) {});

const server = app.listen(8080, function () {

    const host = server.address().address
    const port = server.address().port

    console.log("应用实例，访问地址为 http://localhost:" + port)
    // openDefaultBrowser("http://localhost:" + port)
})

const openDefaultBrowser = function (url) {
    var exec = child_process.exec;
    // console.log(process.platform)
    switch (process.platform) {
        case "darwin":
            exec('open ' + url);
            break;
        case "win32":
            exec('start ' + url);
            break;
        default:
            exec('xdg-open', [url]);
    }
}
