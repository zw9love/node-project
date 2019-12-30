/**
 @author zengwei
 @time 2019/10/11
 **/
let {execTrans, _getNewSqlParamEntity, execQuery, execPaginationQuery} = require('./src/utils/dbHelper')
let {getRandomString, getTime} = require('./src/utils/index')
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const schedule = require('node-schedule');
const logger = require('./logs/logger');
const logMaster = require('log-master');

// 等于是一个定时切割任务
// logMaster.split({ //切割，目前唯一的功能
//   "from": { //源文件夹，可多选。
//     "app": "./logs"
//   },
//   "Suffix": [".log"], //要切割的文件类型，可多选。默认 [".log"]
//   "to": "./splitLog", //目标文件夹,log都会到这里。
//   "Interval": 1000 * 60 * 60 * 24, //切割时间间隔，默认一天。
//   "timeFormat": "yyyy年MM月dd日HH时mm分ss秒", //时间格式(生成的文件夹名),默认为yyyy年MM月dd日HH时mm分ss秒
//   "startTime": "00:00" //开始时间，默认零点,精确到秒的话就："00:00:00"
// });

// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Comté.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次: 秒 分 时 日 月 周
  const job = schedule.scheduleJob('* * * * * *',()=>{
    console.log('scheduleCronstyle:' + new Date());
  });

  setTimeout(function() {
    console.log('定时器取消')
    // 定时器取消
    job.cancel();
  }, 5000);
}

// scheduleCronstyle();

const getFile = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://nba.hupu.com');
  await page.screenshot({path: 'hupu.png'});
  // await page.pdf({path: 'hupu.pdf', format: 'A4'});

  await browser.close();
}

// getFile()

const getClick = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://nba.hupu.com');
  const [response] = await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click('a.mr10'), // 点击该链接将间接导致导航(跳转)
  ]);

  await browser.close();
}

let scrape = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('http://books.toscrape.com/');
  await page.click('#default > div > div > div > div > section > div:nth-child(2) > ol > li:nth-child(1) > article > div.image_container > a > img');
  await page.waitFor(1000);
  const result = await page.evaluate(() => {
    let title = document.querySelector('h1').innerText;
    let price = document.querySelector('.price_color').innerText;
    return {
      title,
      price
    }
  });
  browser.close();
  return result;
};

// scrape().then((value) => {
//     console.log(value); // Success!
// });


const getDimensions = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://nba.hupu.com');

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });

  console.log('Dimensions:', dimensions);

  await browser.close();
}

const getVideoSrc = async () => {
  const browser = await (puppeteer.launch({
    executablePath: puppeteer.executablePath(),
    headless: false
  }))
  var arr = []
  for (let i = 1; i <= 40; i++) {
    console.log('正在抓取全职高手第' + i + '集')
    const targetUrl = `https://goudaitv1.com/play/78727-4-${i}.html`
    console.log(targetUrl)
    const page = await browser.newPage()
    await page.goto(targetUrl, {
      timeout: 0,
      waitUntil: 'domcontentloaded'
    })
    const baseNode = '.row'
    const movieList = await page.evaluate((sel) => {
      var stream = Array.from($(sel).find('iframe#Player').attr('src'))
      stream && (stream = stream.join(''))
      return stream
    }, baseNode)
    arr.push(movieList)
    page.close()
  }
  console.log(arr)
  browser.close()
}

let num = 0

// 单独爬取单页面
let scrapeHupuBBS = async () => {
  // const browser = await puppeteer.launch({headless: false});
  const browser = await puppeteer.launch();
  const url = 'https://bbs.hupu.com/all-gambia'
  const page = await browser.newPage();
  await page.goto(url);
  const lenResult = await page.evaluate(() => {
    return {
      listLength: $('.expanded #container .bbsHotPit .list').length,
      listCellLength: $('.expanded #container .bbsHotPit .list').eq(0).find('ul li').length
    }
  });
  console.log('虎扑bbs热搜条数 = ', lenResult.listLength * lenResult.listCellLength)
  logger.info(`\x1B[32m虎扑bbs热搜条数 = ${lenResult.listLength * lenResult.listCellLength}\x1B[0m`);
  let arr = []
  for (let i = 1; i <= lenResult.listLength; i++) {
    for (let j = 1; j <= lenResult.listCellLength; j++) {
      const link = await page.$(`.expanded #container .bbsHotPit .list:nth-child(${i + 1}) ul li:nth-child(${j}) .textSpan a`)
      const href = await page.$eval(`.expanded #container .bbsHotPit .list:nth-child(${i + 1}) ul li:nth-child(${j}) .textSpan a`, el => el.href)
      if (link) {
        // 1、使用page.waitFor
        //   await link.click()
        // await page.waitFor(1000);
        // console.log(link)
        //   let pages = await browser.pages()
        //   let tmpPath = pages[2]
        //   if(!tmpPath) return
        //   let path = tmpPath.url()
        //   const res = await tmpPath.evaluate(() => {
        //     // let path = $(window)[0].location.href
        //     let content = $('.quote-content').html()
        //     let title = $('#j_data').text()
        //     let author = $('#tpc .author .u').text()
        //     let time = $('#tpc .author .stime').text()
        //     return {
        //       title,
        //       author,
        //       content,
        //       time,
        //       // path
        //     }
        //   });
        //   let sql = 'INSERT INTO bbs_hot(id,title, content, article_time, author, create_time, path) VALUES(?,?,?,?,?,?,?)';
        //   let sqlParams = [getRandomString(), res.title, res.content, res.time, res.author, getTime(), path]
        //   // console.log('res', res)
        //   execQuery(sql, sqlParams).then((result) => {
        //     console.log(`爬虫一条数据成功！ ${++num}`)
        //   }).catch((error) => {
        //     console.error('爬虫一条数据失败！', error)
        //   })
        //   arr.push(res)
        //   await tmpPath.close()

        // 2、不使用page.waitFor
        let newPage = await browser.newPage()
        await newPage.goto(href, {timeout: 0})
        // newPage.on('error', err => {
        //   console.log('页面错误 ', err )
        // })

        let path = newPage.url()
        // let searchSql = 'select * from bbs_hot where path = ?';
        // let searchSqlParams = [path]
        // execQuery(searchSql, searchSqlParams).then(async (result) => {
        //   if (result.length) return
          const res = await newPage.evaluate(() => {
            // let path = $(window)[0].location.href
            let content = $('.quote-content').html()
            let title = $('#j_data').text()
            let author = $('#tpc .author .u').text()
            let time = $('#tpc .author .stime').text()
            return {
              title,
              author,
              content,
              time,
              // path
            }
          });
          let sql = 'INSERT INTO bbs_hot(id,title, content, article_time, author, create_time, path) VALUES(?,?,?,?,?,?,?)';
          let sqlParams = [getRandomString(), res.title, res.content, res.time, res.author, getTime(), path]
          // console.log('res', res)
          execQuery(sql, sqlParams).then((result) => {
            logger.info(`\x1B[32m爬虫一条数据成功！ ${++num}  href = ${href}\x1B[0m`);
            // console.log(`\x1B[32m爬虫一条数据成功！ ${++num}  href = ${href}\x1B[0m`)
          }).catch((error) => {
            if(error.toString().includes('ER_DUP_ENTRY')){
              // console.error('爬虫一条数据失败，数据重复！')
              logger.error('\x1B[31m爬虫一条数据失败，数据重复！\x1B[0m');
            }else{
              // console.error('爬虫一条数据失败！', error)
              logger.error('\x1B[31m爬虫一条数据失败！' + error + '\x1B[0m');
            }
          })
          arr.push(res)
          await newPage.close()
        // }).catch((error) => {
        // })
      }
    }
  }

  browser.close();
  return arr;
};

// scrapeHupuBBS().then((value) => {
//   // console.log(value); // Success!
//   // console.log('爬取了虎扑bbs热搜条数 = ', value.length); // Success!
//   console.log(`\x1B[32m爬取了虎扑bbs热搜条数 = ${num}\x1B[0m`); // Success!
// });

// 分页爬取
let scrapeHupuBBSArticle = async () => {
  // const browser = await puppeteer.launch({headless: false, defaultViewport: null,});
  const browser = await puppeteer.launch();
  browser.on('disconnected', () => {
    browser.disconnect()
  })
  // const url = 'https://bbs.hupu.com/ent'
  const url = 'https://bbs.hupu.com/vote'
  const page = await browser.newPage();
  // page.setViewport({width: 1200, height: 600})
  // await page.goto('https://passport.hupu.com/pc/login?project=bbs&display=&from=http%3A%2F%2Fwww.hupu.com&jumpurl=http://www.hupu.com');
  // await page.waitFor(15000);
  await page.goto(url, {timeout: 0});
  // const link = await page.$(`.showpage .page .nextPage`)

  // 登陆下获取cookie
  // let cookie = await page.cookies()
  // let path = await page.url()
  // console.log('path = ', path)
  // console.log('cookie = ', cookie)

  let cookie = [{
    name: 'ua',
    value: '68583791',
    domain: '.hupu.com',
    path: '/',
    expires: 1609049591.665489,
    size: 10,
    httpOnly: false,
    secure: false,
    session: false
  },
    {
      name: '_cnzz_CV30020080',
      value: 'buzi_cookie%7Cb20027f7.0117.2369.6667.bcd51892a8c0%7C-1',
      domain: 'www.hupu.com',
      path: '/',
      expires: -1,
      size: 71,
      httpOnly: false,
      secure: false,
      session: true
    },
    {
      name: '_dacevid3',
      value: 'b20027f7.0117.2369.6667.bcd51892a8c0',
      domain: '.hupu.com',
      path: '/',
      expires: 1892787191.417651,
      size: 45,
      httpOnly: false,
      secure: false,
      session: false
    },
    {
      name: 'us',
      value: '9b5f3c74726766c3b1ccf93c2eb6a173ac1246d0d54dc1b77d7ef39102d841ebc27ddd5a8aca37d3baf3975a8aad0a690a7354df9144d20619fb6e934f825a9c',
      domain: '.hupu.com',
      path: '/',
      expires: 1580019189.105657,
      size: 130,
      httpOnly: true,
      secure: false,
      session: false
    },
    {
      name: '__dacevst',
      value: 'aea98a43.392ad8f9|1577428991513',
      domain: '.hupu.com',
      path: '/',
      expires: 1577428991,
      size: 40,
      httpOnly: false,
      secure: false,
      session: false
    },
    {
      name: 'u',
      value: '36254822|55So5oi3MTkxOTg0NDUyOQ==|28b8|82a18fe9d4c8bd9b1815737704673faa|d4c8bd9b18157377|aHVwdV9lNGMxZjM3OGNmYmYxYWZm',
      domain: '.hupu.com',
      path: '/',
      expires: 1580019189.105558,
      size: 118,
      httpOnly: true,
      secure: false,
      session: false
    },
    {
      name: '_CLT',
      value: '868ae16f150cf61ab926af24b4aa60be',
      domain: '.hupu.com',
      path: '/',
      expires: 1608963187.466371,
      size: 36,
      httpOnly: false,
      secure: false,
      session: false
    },
    {
      name: '_HUPUSSOID',
      value: 'b8565dbc-9cff-4dc4-acce-53fce83f1216',
      domain: '.hupu.com',
      path: '/',
      expires: 1861251178.616404,
      size: 46,
      httpOnly: false,
      secure: false,
      session: false
    }]

  let count = 5
  logger.info(`\x1B[32m${count}秒后开始爬取数据...\x1B[0m`)
  await page.waitFor(count * 1000);
  let arr = []
  for (let i = 1; i <= 15; i++) {
    logger.info('\x1B[32m当前爬取的页面是：' + url + '-' + i + '\x1B[0m')
    if(i >  10){
      cookie.forEach(async o => {
        await page.setCookie(o) // 即使设置了cookie，爬取较多的时候还是会被对方服务器清除。
      })
    }
    await page.goto(url + '-' + i, {timeout: 0});
    let lenResult = await page.evaluate(() => {
      return {
        listCellLength: $('.expanded #container .bbsHotPit .for-list li').length,
      }
    });
    // await page.waitFor(3000);
    let loopIndex = 0
    logger.info(`\x1B[32m第${i}页总条数: ${lenResult.listCellLength}\x1B[0m`)
    for (let j = 1; j <= lenResult.listCellLength; j++) {
      const tmpLink = await page.$(`.expanded #container .bbsHotPit .for-list li:nth-child(${j}) .titlelink a.truetit`)
      await tmpLink.click()
      await page.waitFor(1000);
      let pages = await browser.pages()
      let tmpPath = pages[2]
      if (!tmpPath) return

      // const href = await page.$eval(`.expanded #container .bbsHotPit .for-list li:nth-child(${i}) .titlelink a.truetit`, el => el.href)
      // let newPage = await browser.newPage()
      // await newPage.goto(href, {timeout: 0})
      try {
        let path = tmpPath.url()
        const res = await tmpPath.evaluate(() => {
          // let path = $(window)[0].location.href
          let content = $('.quote-content').html()
          let title = $('#j_data').text()
          let author = $('#tpc .author .u').text()
          let time = $('#tpc .author .stime').text()
          return {
            title,
            author,
            content,
            time,
            // path
          }
        });
        let sql = 'INSERT INTO bbs_shh(id,title, content, article_time, author, create_time, path) VALUES(?,?,?,?,?,?,?)';
        let sqlParams = [getRandomString(), res.title, res.content, res.time, res.author, getTime(), path]
        // console.log('res', res)
        execQuery(sql, sqlParams).then((result) => {
          ++num
          // console.log(`\x1B[32m爬虫一条数据成功！ ${++loopIndex}  href = ${path}\x1B[0m`)
          logger.info(`\x1B[32m爬虫一条数据成功！ ${++loopIndex}  href = ${path}\x1B[0m`);
        }).catch((error) => {
          if(error.toString().includes('ER_DUP_ENTRY')){
            // console.error('爬虫一条数据失败，数据重复！')
            logger.error(`\x1B[31m爬虫一条数据失败，数据重复！失败页面是: ${path}\x1B[0m`);
          }else{
            // console.error('爬虫一条数据失败！', error)
            logger.error(`\x1B[31m爬虫一条数据失败！${error}, 失败页面是: ${path}\x1B[0m`);
          }
          // console.error('失败页面是：', path)
          // logger.error('\x1B[31m失败页面是：' + path + '\x1B[0m');
        })
        arr.push(res)
        await tmpPath.close()
      }catch(e){
        logger.error(`\x1B[31m${e}\x1B[0m`)
      }

      // let sql = 'INSERT INTO bbs_hot_ent(id,title, content, article_time, author, create_time, path) VALUES(?,?,?,?,?,?,?)';


    }
  }


  // let href = await page.$eval(`.showpage .page .nextPage`, el => el.href)
  // console.log('href = ', href)
  // if(link) link.click()

  browser.close();
  return arr;
};

scrapeHupuBBSArticle().then((value) => {
  // console.log(value); // Success!
  // console.log('爬取了虎扑bbs热搜条数 = ', value.length); // Success!
  console.log(`\x1B[32m总共成功爬取了虎扑bbs条数 = ${num}\x1B[0m`); // Success!
});


let scrapeHKMinisite = async () => {
  const browser = await puppeteer.launch({headless: false});
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.goto('https://viphk.moco.com/mine');
  await page.emulate(devices['iPhone 6']);
  await page.goto('https://viphk.moco.com/login');
  await page.waitFor(10000);
  await page.type('.main .phone-wrapper:nth-child(3) .phone-input input', '18514075699', {delay: 100}); // 输入变慢，像一个用户
  // await page.type('.main .phone-wrapper:nth-child(4) .phone-input input', '111111', {delay: 100}); // 输入变慢，像一个用户
  await page.click('.code-btn')
  await page.waitFor(10000);
  await page.click('.agree')
  await page.click('.commit')
  // 监听ajax数据
  page.on('response', response => {
    // console.log('response.url', response.url())
    let req = response.request()
    if (req.resourceType().toLowerCase() === 'xhr') {
      response.json().then((res) => {
        console.log('res.code = ', res.code)
        console.log('res = ', res)
      })
    }
  })
  // browser.close();
};

// scrapeHKMinisite().then((value) => {
// });
