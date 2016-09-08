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

var dbFileName = "bc-twitter-db.sqlite";
var exists = fs.existsSync(dbFileName);

/*
if (exists)
{
    fs.removeSync(dbFileName);
    exists = false;
}
*/

if (!exists) {
    console.log("Creating DB file " + dbFileName + ".");
    fs.openSync(dbFileName, "w");
}

// Import SQLite 3 & create in-memory Database
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFileName);

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

// all DB prepare statements
const INSERT_USER_PRE_STMT = "INSERT INTO user VALUES (?, ?, ?, ?)";
const FIND_USER_BY_USERNAME_PRE_STMT = "SELECT rowid FROM user WHERE user_name = ?";


// BEGIN Utility functions
 
// END Utility functions

db.serialize(function () {

    if (!exists) {
        var sql = fs.readFileSync("create_tables.sql", "utf8");

        db.exec(sql);

        var stmt = db.prepare(INSERT_USER_PRE_STMT);

        //Insert users
        stmt.run("cvaughan", "Chris", null, "Vaughan");
        stmt.run("jku", "Jing", null, "Ku");

        stmt.finalize();
    }

    db.each("SELECT rowid AS id, user_name FROM user", function (err, row) {
        console.log(row.id + ": " + row.user_name);
    });
});

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

    db.serialize(function () {

        if (!stringUtil(req.body.userName).isEmpty() && !stringUtil(req.body.firstName).isEmpty() && !stringUtil(req.body.lastName).isEmpty()) {
            // does the user already exist?
            db.get(FIND_USER_BY_USERNAME_PRE_STMT, req.body.userName, function (err, row) {

                if (err) {
                    res.send("Error: " + err);
                }
                else {
                    if (row) {
                        res.send('Error: user name is already in use');
                    }
                    else {
                        var stmt = db.prepare(INSERT_USER_PRE_STMT);
                        var mName = null;
                        if (!stringUtil(req.body.middleName).isEmpty()) {
                            mName = req.body.middleName;
                        }
                        stmt.run(req.body.userName, req.body.firstName, mName, req.body.lastName);
                        stmt.finalize();
                        res.send('ok');
                    }
                }
            });
        } else {
            res.send('Username, First Name, & Last Name are required!')
        }
    });
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