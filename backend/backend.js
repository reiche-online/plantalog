/*
 *  backend.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Das Modul welches das Backend steuert
 *  Hier wird neben dem Login und logout nur noch die
 *  Angular App gestartet
 *
 *  Author: Marcus Reiche
 */

var express         = require('express'),
    mongoose        = require('mongoose'),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    session         = require('express-session');

var app = module.exports = express();

/*
 *  Einbinden der Middelware:
 *      bodyParser: Wird genutzt um den Request Body zu durchsuchen
 *      CookieParser: Wird in Verbindung mit Express-session zum
 *      Sessionhandling benötigt
 *      Express-Session: Wird für das Sessionhandling benötigt
 */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: '1v943cp79xy35fhj79f4f',
    resave: true,
    saveUninitialized: true
}));

/*
 *  Das Routing für den Admin Bereich, welcher selber eine Angular
 *  Webapp ist.
 *  Falls der User noch nicht eingelogt ist wird er auf das Login Form
 *  weitergeleitet
 */

app.get('/admin/', function(req,res) {
    if(req.session.login == true) {
        res.render(__dirname + '/index.ejs');
    }else {
        res.redirect('/admin/login');
    }

});

/*
 *  Post Und Get für den Login.
 *  TODO Login Daten nicht hardcodet in der Datei, sondern in Datenbank
 */

app.get('/admin/login', function(req,res) {
    res.render(__dirname + '/login.ejs', {error: req.query.error });
});

app.post('/admin/login', function(req,res){
    //  Die Abfrage sollte einen User aus der Datenbank holen und diesen abgleichen
    //  Der einfach halt halber wird hier nur der user admin mit dem PW: admin abgefragt
    if(req.body.username == "admin" && req.body.password == "admin") {
        req.session.login = true;
        res.redirect('/admin/');
    }else if(req.body.username != "admin"){
        req.session.login = false;
        res.redirect('/admin/login?error=1');
    }else if(req.body.password != "admin"){
        req.session.login = false;
        res.redirect('/admin/login?error=2');
    }
});

/*
 *  Der Logout Link, sodass der Nutzer sich wieder abmelden kann
 */

app.get('/admin/logout', function(req,res) {
    req.session.login = false;
    res.redirect('/');
});