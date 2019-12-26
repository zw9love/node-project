/**
 @author zengwei
 @time 2019/10/11
 **/
let {execTrans, _getNewSqlParamEntity, execQuery, execPaginationQuery} = require('./src/utils/dbHelper')
let {getRandomString, getTime} = require('./src/utils/index')
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

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
let scrapeHupuBBS = async () => {
    // const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://bbs.hupu.com/all-gambia');
    const lenResult = await page.evaluate(() => {
        return {
            listLength: $('.expanded #container .bbsHotPit .list').length,
            listCellLength: $('.expanded #container .bbsHotPit .list').eq(0).find('ul li').length
        }
    });
    let arr = []
    for(let i = 1; i <= lenResult.listLength; i++){
        for(let j = 1; j <= lenResult.listCellLength; j++) {
            const link = await page.$(`.expanded #container .bbsHotPit .list:nth-child(${i+1}) ul li:nth-child(${j}) .textSpan a`)
            if (link) {
                await link.click()
                await page.waitFor(5000);
                let pages = await browser.pages()
                const res = await pages[2].evaluate(() => {
                    let content = $('.quote-content').html()
                    let title = $('#j_data').text()
                    let author = $('#tpc .author .u').text()
                    let time = $('#tpc .author .stime').text()
                    return {
                        title,
                        author,
                        content,
                        time
                    }
                });
                let sql = 'INSERT INTO bbs_hot(id,title, content, article_time, author, create_time) VALUES(?,?,?,?,?,?)';
                let sqlParams = [getRandomString(), res.title, res.content, res.time, res.author, getTime()]
                // console.log('res', res)
                execQuery(sql, sqlParams).then((result) => {
                    console.log(`爬虫一条数据成功！ ${++num}`)
                }).catch((error) => {
                    console.error('爬虫一条数据失败！', error)
                })
                arr.push(res)
                await pages[2].close()
            }
        }
    }

    browser.close();
    return arr;
};

scrapeHupuBBS().then((value) => {
    // console.log(value); // Success!
    // console.log('爬取了虎扑bbs热搜条数 = ', value.length); // Success!
    console.log('爬取了虎扑bbs热搜条数 = ', num); // Success!
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
        if(req.resourceType().toLowerCase() === 'xhr'){
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
