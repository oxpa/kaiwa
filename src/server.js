var fs = require('fs');
var express = require('express');
var helmet = require('helmet');

var config = JSON.parse(fs.readFileSync('./dev_config.json'));

var app = express();
var bodyParser = require('body-parser')
var compression = require('compression');
var serveStatic = require('serve-static');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(serveStatic('./public'));
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());

app.get('/manifest.webapp', function (req, res, next) {
    var webappManifest = fs.readFileSync('./public/manifest.webapp');
    res.set('Content-Type', 'application/x-web-app-manifest+json');
    res.send(webappManifest);
});

app.get('/manifest.cache', function (req, res, next) {
    var cacheManifest = fs.readFileSync('./public/manifest.cache');
    res.set('Content-Type', 'text/cache-manifest');
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.send(cacheManifest);
});

app.use(function handleError(err, req, res, next) {
    var errorResult = {message: 'Something bad happened :('};

    if (config.isDev) {
        if (err instanceof Error) {
            if (err.message) {
                errorResult.message = err.message;
            }

            if (err.stack) {
                errorResult.stack = err.stack;
            }
        }
    }

    res.status(500);
    res.render('error', errorResult);
});

app.listen(config.http.port, function () {
    console.log('Kaiwa running at: ' + config.http.baseUrl);
});
