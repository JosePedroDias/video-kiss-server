var path = require('path');
var fs   = require('fs');
var url  = require('url');

var express    = require('express');
var expHbs     = require('express-handlebars');
var bodyParser = require('body-parser');
var multer     = require('multer');
var send       = require('send');



var PORT = 3000;



var app = express();

app.engine('.hbs', expHbs({defaultLayout:'main', extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use('/static', express.static('static'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended:true})); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data



function rndBase32(len) {
    return ( ~~(Math.random() * Math.pow(32, len)) ).toString(32);
}

function reqFileName(req) {
    var fn = url.parse(req.url).pathname;
    return fn.split('/').pop();
}



app.get('/', function (req, res) {
    res.render('home');
});



app.get('/list', function (req, res) {
    fs.readdir('media', function(err, files) {
        if (err) { throw err; }

        res.render('list', {files:files});
    })
});



app.get('/upload', function (req, res) {
    res.render('upload');
});



app.post('/upload', function (req, res) {
    var f = req.files.file;
    var tempPath = f.path;
    var tempExt = path.extname(f.name).toLowerCase();
    var randName = rndBase32(6);
    var targetPath = ['media/', randName, tempExt].join('');
    var filename = [randName, tempExt].join('');

    fs.rename(tempPath, targetPath, function(err) {
        if (err) { throw err; }

        res.redirect('/watch/' + filename);
    });
});



app.get('/video/:file', function (req, res) {
    //console.log(req.params.name);
    var fn = reqFileName(req);
    //console.log('-> %s', fn);
    send(req, fn, {root:'media'})
        //.on('error', error)
        //.on('directory', redirect)
        //.on('headers', headers)
        .pipe(res);
});



app.get('/watch/:file', function (req, res) {
    var fn = reqFileName(req);
    res.render('watch', {filename:fn});
});



var server = app.listen(PORT, function() {
    console.log('video-kiss-server app listening on port %s...', PORT);
});