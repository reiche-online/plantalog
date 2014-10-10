/*
 *  frontend.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Es wird lediglich Express initialisiert und auf die
 *  Angular WebApp weitergeleitet
 *
 *  Author: Marcus Reiche
 */

var express = require('express');

var app = module.exports = express();

app.get('/', function(req,res) {
    res.render(__dirname + '/index.ejs');
});

