var fs = require('fs');
var express = require('express');
var app = express();

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