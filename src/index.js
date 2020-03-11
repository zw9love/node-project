/**
 @author zengwei
 @time 2019/7/27
 **/
let {sendMail, getRandomString, aesEncrypt, aesDecrypt} = require('./utils/index.js')
let {getData, postData} = require('./utils/http.js')
const fs = require('fs');
// const redis = require("redis");
// const client = redis.createClient();
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


// 测试验证码
app.get('/captcha2', (req, res, next) => {
  //获取资源路径


  function getRandomNumber(m,n) {
    return Math.floor(Math.random()*(n-m+1))+m
  }
  getRandomNumber(1,5);
  var realpath = `/Users/zengwei/work/node-project/public/static/images/demo${getRandomNumber(1,5)}.jpg`
  console.log('realpath', realpath)

  //加载需要显示的图片资源
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  res.end(fs.readFileSync(realpath));
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
        // recipient:'18514075699@163.com,823334587@qq.com',
        recipient:'18514075699@163.com',
        title:'情人节情人节',
        text:'情人节情人节快乐，有附件。',
        name: '你大爷',
        html:'<h1>Hi, weiwei,这是一封测试邮件111222333</h1>',
        files:[
            {
                filename:'config.json',
                path:'./package.json' // 当前路径是项目根路径
            },
            {
                filename:'index.ts',
                path:'./src/index.js'
            }
        ]
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

// -----------------------------测试多进程cluster-------------------------------

// 不特意开启多进程支持的正常情况下
// const seqArr = [44, 42, 43, 44]
//
// function fibonacci (n) {
//     return n === 0
//         ? 0
//         : n === 1
//             ? 1
//             : fibonacci(n - 1) + fibonacci(n - 2)
// }
//
// function calculate (seq, taskId) {
//     return new Promise((resolve, reject) => {
//         console.log(`Task ${taskId} starts calculating.`)
//         const start = Date.now()
//         const result = fibonacci(seq)
//         console.log(`The result of task ${taskId} is ${result}, taking ${Date.now() - start} ms.`)
//         return resolve(result)
//     })
// }
//
// ;(async function main () {
//     console.time('main')
//     const results = await Promise.all(seqArr.map(calculate))
//     results.forEach((result, index) => console.log(`Task ${index}'s result is ${result}`))
//     console.timeEnd('main')
// })()

// 使用cluster多进程
// const cluster = require('cluster')
// const numCPUs = require('os').cpus().length
//
// function fibonacci (n) {
//     return n === 0
//         ? 0
//         : n === 1
//             ? 1
//             : fibonacci(n - 1) + fibonacci(n - 2)
// }
//
// if (cluster.isMaster) {
//     const seqArr = [44, 42, 43, 44]
//     let endTaskNum = 0
//
//     console.time('main')
//     console.log(`[Master]# Master starts running. pid: ${process.pid}`)
//     for (let i = 0; i < numCPUs; i++) {
//         const worker = cluster.fork()
//         worker.send(seqArr[i] + '')
//     }
//     cluster.on('message', (worker, message, handle) => {
//         console.log(`[Master]# Worker ${worker.id}: ${message}`)
//         endTaskNum++
//         if (endTaskNum === 4) {
//             console.timeEnd('main')
//             cluster.disconnect()
//         }
//     })
//     cluster.on('exit', (worker, code, signal) => console.log(`[Master]# Worker ${worker.id} died.`))
// } else {
//     process.on('message', seq => {
//         console.log(`[Worker]# starts calculating...`)
//         const start = Date.now()
//         const result = fibonacci(seq)
//         console.log(`[Worker]# The result of task ${process.pid} is ${result}, taking ${Date.now() - start} ms.`)
//         process.send('My task has ended.')
//     })
// }

// 使用mongo
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/runoob";
//
// MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
//     if (err) throw err;
//     console.log("数据库已创建!");
//
//     var dbo  = db.db("runoob");
//     // dbo .createCollection('site', function (err, res) {
//     //     if (err) throw err;
//     //     console.log("创建集合!");
//     //     db.close();
//     // });
//
//     // var myobj = { name: "菜鸟教程1", url: "www.runoob1" };
//     // dbo.collection("site").insertOne(myobj, function(err, res) {
//     //     if (err) throw err;
//     //     console.log("文档插入成功");
//     //     db.close();
//     // });
//
//     // var myobj =  [
//     //     { name: '菜鸟工具', url: 'https://c.runoob.com', type: 'cn'},
//     //     { name: 'Google', url: 'https://www.google.com', type: 'en'},
//     //     { name: 'Facebook', url: 'https://www.google.com', type: 'en'}
//     // ];
//     // dbo.collection("site").insertMany(myobj, function(err, res) {
//     //     if (err) throw err;
//     //     console.log("插入的文档数量为: " + res.insertedCount);
//     //     db.close();
//     // });
//
//     // dbo.collection("site"). find({}).toArray(function(err, result) { // 返回集合中所有数据
//     //     if (err) throw err;
//     //     console.log(result);
//     //     db.close();
//     // });
//
//     // var whereStr = {"name":'菜鸟教程'};  // 查询条件
//     // dbo.collection("site").find(whereStr).toArray(function(err, result) {
//     //     if (err) throw err;
//     //     console.log(result);
//     //     db.close();
//     // });
//
//     // var whereStr = {"name":'菜鸟教程'};  // 查询条件
//     // var updateStr = {$set: { "url" : "https://www.runoob.com" }};
//     // dbo.collection("site").updateOne(whereStr, updateStr, function(err, res) {
//     //     if (err) throw err;
//     //     console.log("文档更新成功");
//     //     db.close();
//     // });
//
//     // var whereStr = {"type":'en'};  // 查询条件
//     // var updateStr = {$set: { "url" : "https://www.runoob.com" }};
//     // dbo.collection("site").updateMany(whereStr, updateStr, function(err, res) {
//     //     if (err) throw err;
//     //     console.log(res.result.nModified + " 条文档被更新");
//     //     db.close();
//     // });
//
//     // var whereStr = {"name":'菜鸟教程'};  // 查询条件
//     // dbo.collection("site").deleteOne(whereStr, function(err, obj) {
//     //     if (err) throw err;
//     //     console.log("文档删除成功");
//     //     db.close();
//     // });
//
//     // var whereStr = { type: "en" };  // 查询条件
//     // dbo.collection("site").deleteMany(whereStr, function(err, obj) {
//     //     if (err) throw err;
//     //     console.log(obj.result.n + " 条文档被删除");
//     //     db.close();
//     // });
//
//     // var mysort = { type: 1 };  // { type: 1 }  // 按 type 字段升序; { type: -1 } // 按 type 字段降序
//     // dbo.collection("site").find().sort(mysort).toArray(function(err, result) {
//     //     if (err) throw err;
//     //     console.log(result);
//     //     db.close();
//     // });
//
//     // dbo.collection("site").find().limit(2).toArray(function(err, result) {
//     //     if (err) throw err;
//     //     console.log(result);
//     //     db.close();
//     // });
//
//     // dbo.collection("site").find().skip(2).limit(2).toArray(function(err, result) {
//     //     if (err) throw err;
//     //     console.log(result);
//     //     db.close();
//     // });
//
//     // dbo.collection('orders').aggregate([
//     //     { $lookup:
//     //             {
//     //                 from: 'products',            // 右集合
//     //                 localField: 'product_id',    // 左集合 join 字段
//     //                 foreignField: '_id',         // 右集合 join 字段
//     //                 as: 'orderdetails'           // 新生成字段（类型array）
//     //             }
//     //     }
//     // ]).toArray(function(err, res) {
//     //     if (err) throw err;
//     //     console.log(JSON.stringify(res));
//     //     db.close();
//     // });
//
//     // 删除 test 集合
//     // dbo.collection("test").drop(function(err, delOK) {  // 执行成功 delOK 返回 true，否则返回 false
//     //     if (err) throw err;
//     //     if (delOK) console.log("集合已删除");
//     //     db.close();
//     // });
//
// });
