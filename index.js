// Import file system library
var fs = require('fs');

// Import Express library
var express = require('express');
var app = express();

// Import SQLite 3 & create in-memory Database
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(":memory:");

// Port constant
var port = 8080;

function readFile(fileName, encoding) {

    return new Promise(function(resolve, reject) {

        fs.readFile(fileName, encoding, function(err, contents) {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(contents);
            }
        });
    });
};

db.serialize(function() {
  
    db.run("CREATE TABLE user (name VARCHAR(20))");
  
    var stmt = db.prepare("INSERT INTO user VALUES (?)");
  
    //Insert users
    stmt.run("cvaughan");
    stmt.run("jku");
  
    stmt.finalize();

    db.each("SELECT rowid AS id, name FROM user", function(err, row) {
        console.log(row.id + ": " + row.name);
    });
});

db.close();

app.get('/', function (req, res) {

    var out = "";

    readFile('header.html', 'utf8').then(
        function(html){
            out += html;
            return readFile('tweet-page.html', 'utf8');
        }
    ).then(
        function(html) {
            out += html;
            return readFile('footer.html', 'utf8');
        }
    ).then(
        function(html) {
            out += html;
            res.send(out);
        }
    ).catch(
        function(err) {
            console.log("Unable to send html: " + err);
        }
    );
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});