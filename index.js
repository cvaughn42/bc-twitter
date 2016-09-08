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

var session = require('express-session')
app.use(session({
    /*
    genid: function(req) {
        return genuuid();   // use UUIDs for session IDs
    },
    */
    secret: 'currentUser',
    resave: false,
    saveUninitialized: false
}));

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

function checkAuth(req, res, next) {
    if (!req.session.currentUser) {
        readFile('login.html', 'utf8').then(function (html) {
            res.send(html);
        });
    } else {
        next();
    }
}

/*
app.all('/*', function (req, res) {
    if (stringUtil(req.url).startsWith('/login')) {
        console.log('cont to login page');
        res.redirect('/login');
    } else if (!req.body.currentUser) {
        console.log('sending to login.html');
        readFile('login.html', 'utf8').then(function (html) {
            res.send(html);
        });
    } else {
        console.log('passing login page');
        //next();
    }
});
*/

app.get('/', checkAuth, function (req, res) {

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
}).get('/createUser', checkAuth, function (req, res) {

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
}).post('/login', function (req, res) {
    console.log('in login post');
    if (stringUtil(req.body.userName).isEmpty() || stringUtil(req.body.password).isEmpty()) {
        readFile('login.html', 'utf8').then(function (html) {
            res.send(html);
        });
    } else {
        console.log('calling before authenticate()');
        
        dao.authenticate(req.body.userName, req.body.password, function(err, success) {

            if (err)
            {
                res.send(err);
            }
            else
            {
                console.log('user authenticated');
                if (success)
                {
                    req.session.currentUser = req.body.userName;
                }

                res.redirect('/');        
            }
        });
    }

}).post('/user', function (req, res) {

    var nullIfEmpty = function (val) {

        console.log("val = " + val);

        if (stringUtil(val).isEmpty()) {
            return null;
        }

        return val;
    };

    try {
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
    catch (err) {
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