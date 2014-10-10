/*
 *  api.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Das Modul welches die api steuert.
 *  Hier bei werden keine Views genutzt da die Daten, welche
 *  die API zurücksendet ausschließlich im Json Format sind.
 *  Da die API sehr klein ist wurden die Models direkt mit den
 *  Routing in einer Datei kombiniert.
 *
 *  Author: Marcus Reiche
 */

var express = require('express'),
    mongoose = require('mongoose'),
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
 *  Verbindung zur MongoDB aufbauen, mithilfe von Mongoose
 *  Die Datenbank befindet sich bei einem Cloudeservice: mongolab
 *  Kostenfrei bis 500mb
 */

mongoose.connect('mongodb://admin:plantalog@ds063769.mongolab.com:63769/plantalog');

//  Eine Instanz der der Verbindung erzeugen
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Datenbank Verbindungsfehler:'));

//  Wenn die Verbindung steht kann die API Starten
db.once('open', function() {

    /*
     *  Erzeugen zweier Schemas für Pflanzen und Krankheiten, sozusagen
     *  die Muster für das Model. Dabei wird das Json Format der MongoDB
     *  Dokumente vorgegeben.
     */

    var plantSchema = new mongoose.Schema({
        name        : String,
        desc        : String,
        short_desc  : String,
        freeze      : Number,
        sun         : Number,
        difficulty  : Number,
        water       : Number,
        energy      : Number,
        calories    : Number,
        protein     : Number,
        carbs       : Number,
        fat         : Number,
        vitamins    : String,
        tipps       : [{
                        name: String,
                        text: String
                    }],
        recipes     : [{
                        name: String,
                        link: String
                    }],
        illnesss    :[String]
    });

    var illnessSchema = new mongoose.Schema({
        name: String,
        desc: String
    });

    /*
     *  Erzeugen der zwei Models, welche die jeweiligen Schemas
     *  zugewiesen bekommen. Diese können nun von der API genutzt werden.
     */

    var Plant = mongoose.model('plants', plantSchema);
    var Illness = mongoose.model('illnesses', illnessSchema);

    /*
     *  START REST API (/api/plant)
     *
     *  Es werden folgende Dienste zur Verfügung gestellt:
     *  GET     Holt genau eine Pflanze aus der Datenbank       ALL
     *  POST    Sendet genau eine Neue Pflanze an die Datenbank ADMIN
     *  PUT     Updated genau eine Pflanze aus der Datenbank    ADMIN
     *  DELETE  Löscht genau eine Pflanze aus der Datenbank     ADMIN
     *
     */
    app.get('/api/plant', function(req,res) {
        Plant.findOne({name: req.query.name},function(err, queryPlant) {
            res.json(queryPlant);
        });
    });

    app.post('/api/plant', function(req,res) {
        if(req.session.login) {
            new Plant(req.body).save(function (err) {
                res.send('neuer eintrag');
            });
        }
    });

    app.put('/api/plant',function(req,res){
        if(req.session.login){
            Plant.findOneAndUpdate({name: req.body.oldName}, req.body, function(err, queryPlant) {
                res.json(req.body.oldName);
            });
        }
    });

    app.delete('/api/plant', function(req,res) {
        if(req.session.login){
            Plant.findOne({name: req.query.name}).remove().exec(function(err) {
                res.send('deleted');
            });
        }
    });

    /*
     *  ENDE REST API (/api/plant)
     */

    /*
     *  Findet alle Pflanzen welche den Suchstring im Namen haben
     *  wird für die Frontend Suche genutzt
     */
    app.get('/api/find', function(req,res) {
        Plant.find({name: new RegExp(req.query.input, "i")},function(err, query) {
            res.json(query);
        });
    });

    /*
     *  Findet alle Pflanzen in der Datenbank
     *  wird für die Startseite des Backends genutzt
     */
    app.get('/api/allplants', function(req,res) {
       Plant.find(function(err, allplants) {
           res.json(allplants);
       })
    });

    /*
     *  Findet alle Krankheiten in der Datenbank
     *  Wird für das Formular im Backend genutzt
     */
    app.get('/api/allillness', function(req,res) {
        Illness.find(function(err, queryIllness) {
            res.json(queryIllness);
        });

    });

    /*
     *  Findet eine Krankheit in der Datenbakn
     *  Wird für das Frontend benutzt
     */
    app.get('/api/illness', function(req,res) {
        Illness.findOne({name: req.query.name},function(err, queryIllness) {
            res.json(queryIllness);
        });

    });
});

