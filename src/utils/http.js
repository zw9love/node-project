const http = require('http')
const https = require('https')
const querystring = require('querystring');
const apiHost = 'localhost'
const port = 8080

function getData(path, params = {}){
    let data = {...params, time: new Date().getTime()};//这是需要提交的数据
    let content = querystring.stringify(data);
    let url = path + '?' + content
    console.log('url', url)
    let options = {
        hostname: apiHost,
        port: port,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    return new Promise(function(resolve, reject){
        let req = http.request(options, function(res){
            try {
                // var body = [];
                let rawData = '';
                res.on('data', function(chunk){
                    // body.push(chunk);
                    rawData += chunk;
                });
                res.on('end', function(){
                    const parsedData = JSON.parse(rawData);
                    // body = Buffer.concat(body);
                    resolve(parsedData);
                });
            } catch (e) {
                console.error(e.message);
                reject(e)
            }
        });

        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            reject(e)
        });
        req.end();
    })

}

function postData(path, params){
    let data = {...params, time: new Date().getTime()};//这是需要提交的数据
    let content = querystring.stringify(data);
    console.log('content', content)
    let options = {
        hostname: apiHost,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    return new Promise(function(resolve, reject){
        let req = http.request(options, function(res){
            try {
                // var body = [];
                let rawData = '';
                res.on('data', function(chunk){
                    // body.push(chunk);
                    rawData += chunk;
                });
                res.on('end', function(){
                    const parsedData = JSON.parse(rawData);
                    // body = Buffer.concat(body);
                    resolve(parsedData);
                });
            } catch (e) {
                console.error(e.message);
                reject(e)
            }
        });

        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            reject(e)
        });
        req.write(content);
        req.end();
    })

}
module.exports = {
    getData,
    postData
}
