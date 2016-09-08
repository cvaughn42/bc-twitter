// Import file system library
var fs = require('fs-extra');

// Import Express library
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var stringUtil = require('string');

var dao = require('./db.js');

// Port constant
var port = 8080;

function readFile(fileName, encoding) {

    return new Promise(function (resolve, reject) {

        fs.readFile(fileName, encoding, function (err, contents) {
            if (err) {
                reject(err);
            }
            else {
                resolve(contents);
            }
        });
    });
};

app.get('/', function (req, res) {

    var out = "";

    readFile('header.html', 'utf8').then(
        function (html) {
            out += html;
            return readFile('tweet-page.html', 'utf8');
        }
    ).then(
        function (html) {
            out += html;
            return readFile('footer.html', 'utf8');
        }
        ).then(
        function (html) {
            out += html;
            res.send(out);
        }
        ).catch(
        function (err) {
            console.log("Unable to send html: " + err);
        }
        );
}).get('/createUser', function (req, res) {

    var out = "";

    readFile('header.html', 'utf8').then(
        function (html) {
            out += html;
            return readFile('new-user.html', 'utf8');
        }
    ).then(
        function (html) {
            out += html;
            return readFile('footer.html', 'utf8');
        }
        ).then(
        function (html) {
            out += html;
            res.send(out);
        }
        ).catch(
        function (err) {
            console.log("Unable to send html: " + err);
        }
        );
}).post('/user', function (req, res) {

   var nullIfEmpty = function(val) {

        console.log("val = " + val);

        if (stringUtil(val).isEmpty())
        {
            return null;
        }
        
        return val;
    };

    try
    {
        var user = {
            userName: nullIfEmpty(req.body.userName),
            password: nullIfEmpty(req.body.password),
            firstName: nullIfEmpty(req.body.firstName),
            middleName: nullIfEmpty(req.body.middleName),
            lastName: nullIfEmpty(req.body.lastName)
        };

        console.dir(user);

        dao.createUser(user);

        res.send('ok');
    }
    catch (err)
    {
        res.send(err);
    }
});

var server = app.listen(port, function () {
    console.log('Example app listening on port ' + port + '!');
});

// Fires when node is terminated?
//
process.on('SIGTERM', function () {
    server.close(function () {
        db.close();
        console.log("Closed out remaining connections.");
    });
});