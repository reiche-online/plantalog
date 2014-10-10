/*
 *  server.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Initialisierung der App, diese Datei wird von Node.js ausgeführt
 *  und startet alle weiteren Teile der Application.
 *
 *  Author: Marcus Reiche
 */

/*
 *  erzeugen der App mit Hilfe von express.js
 *  Dabei wird der Port festgelegt und die view engine
 */

var express = require('express');

// Port für die App setzen
var port = process.env.PORT || 5000;

//Die App erzeugen, mit Hilfe von Express
var app = express();

//Die View Engine festlegen, in diesem fall embeded Javascript
app.set("view engine", "ejs");

/*
 *  Einbinden der einzelnen Bestandteile der Webapp
 */

//frontend einbinden
var frontend = require('./frontend/frontend.js');
app.use(frontend);

//admin einbinden
var admin = require('./backend/backend.js');
app.use(admin);

//api einbinden
var api = require('./api/api.js');
app.use(api);

/*
 *  Einfache rewrites für Media und Co, um die Pfade für Frontend und Backende
 *  einfacher, kürzer zu gestalten.
 */

//rewrites frontend
app.use('/js', express.static(__dirname + '/frontend/js'));
app.use('/css', express.static(__dirname + '/frontend/css'));
app.use('/img', express.static(__dirname + '/media/img'));
app.use('/views', express.static(__dirname + '/frontend/views'));

//rewrites backend
app.use('/admin/js', express.static(__dirname + '/backend/js'));
app.use('/admin/css', express.static(__dirname + '/backend/css'));
app.use('/admin/img', express.static(__dirname + '/media/img'));
app.use('/admin/views', express.static(__dirname + '/backend/views'));

/*
 *  404 Page, falls eine API Call ins leere geht, soll die 404.ejs gerendert werden
 *  Für Frontend und Backend werden Fehler automatisch auf die Startseiten
 *  weitergeleitet.
 */

app.get('*', function(req, res){
    res.render(__dirname + '/404.ejs');
});

/*
 *  Hier wird die App initialisiert und ist über den definierten Port erreichbar
 */

app.listen(port, function() {
    console.log("Plantalog läuft Port "+port);
});