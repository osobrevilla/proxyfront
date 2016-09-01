
/*
 *  urlproxy.js - A super simple url proxy server
 *  2015, Oscar Sobrevilla
 *  Licensed under the MIT license.
 *
 *    How it works?
 *    ==================
 *
 *    Have some query string params how:
 *
 *    @url: The url that i wanna apply the proxy
 *    @allowAllOrigin: set flag to 1 for write header "Access-Control-Allow-Origin" = "*" how response
 *    @basicAuth: server basic auth like user:password (Optional)
 *
 *    var urlToProxy = encodeURIComponent("http://miurltoproxy.com?arg=1&arg=2..");
 *
 *    $.ajax({
 *        url: "http://localhost:5050?url=" + urlToProxy + "&allowAllOrigin=1&basicAuth=user:password");
 *    });
 */

var http = require('http');
var url = require('url');
var program = require('commander');
 
program
  .version('0.0.1')
  .option('-p, --port <n>', 'port used for proxy', parseInt)
  .parse(process.argv);

const PORT = program.port || 5050;

function onRequest(clientReq, clientResp) {

    var query = url.parse(clientReq.url, true).query || {};

    if (query && query.url) {

        console.log('Proxy URL.. => ' + clientReq.url);

        var urlParts = url.parse(query.url, true);

        var basicAuth = query.basicAuth || null;
        var proxy = http.request({
            protocol: urlParts.protocol,
            hostname: urlParts.hostname,
            port: urlParts.port || 80,
            path: urlParts.path,
            method: 'GET',
            auth: basicAuth,
            query: urlParts.query
        }, function(res) {
            var headers = {};

            headers['Content-Type'] = res.headers['content-type'];

            if (query.allowAllOrigin){
              headers['Access-Control-Allow-Origin'] = '*';
            }

            clientResp.writeHead(200, headers);

            res.pipe(clientResp, {
                end: true
            });
        });
        clientReq.pipe(proxy, {
            end: true
        });
    } else {
        clientResp.writeHead(200, {
            'Content-Type': 'image/x-icon'
        });
        clientResp.end();
        console.log('favicon requested..');
        return;
    }
}

http.createServer(onRequest).listen(PORT, function() {
    console.log("working proxyfront.js over %s.. port", PORT);
});
