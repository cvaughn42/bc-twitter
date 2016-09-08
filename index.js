// Import file system library
var fs = require('fs-extra');

// Import Express library
var express = require('express');
var app = express();

var dbFileName = "bc-twitter-db.sqlite";
var exists = fs.existsSync(dbFileName);
if (exists)
{
    fs.removeSync(dbFileName);
    exists = false;
}

if(!exists) {
  console.log("Creating DB file " + dbFileName + ".");
  fs.openSync(dbFileName, "w");
}

// Import SQLite 3 & create in-memory Database
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFileName);

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
  
    if (!exists)
    {
        var sql = fs.readFileSync("create_tables.sql", "utf8");

        db.exec(sql);
    
        var stmt = db.prepare("INSERT INTO user VALUES (?)");
    
        //Insert users
        stmt.run("cvaughan");
        stmt.run("jku");
    
        stmt.finalize();
    }

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