var express = require('express');
var app = express();
var bodyParser = require('body-parser');

/***  at&t M2X ***/
var config = require("./lib/config.js");
var M2X = require("m2x");

var m2x = new M2X(config.api_key);
/*---    ---*/

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


/*** call the device set for M2X***/
m2x.status(function(status) {
    console.log(status);
});

m2x.devices.list(function(response) {
    if (response.isSuccess()) {
        response.json.devices.forEach(function(device) {
            console.log(device);
        });
    } else {
        console.log(response.error());
    }
});

/*** server listener ***/
app.listen(3000);
console.log("Server running port 3000");
