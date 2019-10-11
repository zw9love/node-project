/**
 @author zengwei
 @time 2019/10/11
 **/

const puppeteer = require('puppeteer');

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
            console.log('sel', sel)
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


let scrapeHupuBBS = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://bbs.hupu.com/all-gambia');
    // await page.click('.expanded #container .list');
    // await page.waitFor(1000);
    const result = await page.evaluate(() => {
        let arr = []
        $('.expanded #container .list ul li').each(function(){
            let title = $(this).find('.textSpan a span.red').text();
            arr.push({
                title
            })
        })
        return arr
    });
    browser.close();
    return result;
};

// scrapeHupuBBS().then((value) => {
//     console.log(value); // Success!
// });

// let scrapeHupuBBSAndContent = async () => {
//     const browser = await puppeteer.launch({headless: false});
//     const page = await browser.newPage();
//     await page.goto('https://bbs.hupu.com/all-gambia');
//     // await page.click('.expanded #container .list ul li:first-child .textSpan a span.red');
//     // await page.waitFor(1000);
//
//     const [response] = await Promise.all([
//         page.waitForNavigation(), // The promise resolves after navigation has finished
//         page.click('.expanded #container .list ul li:first-child .textSpan a span.red'), // 点击该链接将间接导致导航(跳转)
//     ]);
//
//     page.close()
//
//     const result = await response.evaluate(() => {
//         // let arr = []
//         // $('.expanded #container .list ul li').each(function(){
//         //     let title = $(this).find('.textSpan a span.red').text();
//         //     arr.push({
//         //         title
//         //     })
//         // })
//         // return arr
//         let content = $('.quote-content').html()
//         return {
//             content: content || ''
//         }
//     });
//     browser.close();
//     return result;
// };


let scrapeHupuBBSAndContent = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://bbs.hupu.com/all-gambia');
    await page.waitForSelector('.expanded #container .list ul li:first-child .textSpan a span.red'); // 等待并获取点击跳转的goto元素
    const link = await page.$('.expanded #container .list ul li:first-child .textSpan a span.red');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); // 声明变量
    await link.click(); // 点击跳转
    const newPage = await newPagePromise; // newPage就是a链接打开窗口的Page对象

    // await page.click('.expanded #container .list ul li:first-child .textSpan a span.red');
    // await page.waitFor(1000);

    const result = await newPage.evaluate(() => {
        // let arr = []
        // $('.expanded #container .list ul li').each(function(){
        //     let title = $(this).find('.textSpan a span.red').text();
        //     arr.push({
        //         title
        //     })
        // })
        // return arr
        // let content = $('.quote-content').html()
        let content = document.querySelectorAll('.quote-content').innerText
        return {
            content: content || ''
        }
    });
    browser.close();
    return result;
};


scrapeHupuBBSAndContent().then((value) => {
    console.log(value); // Success!
});
