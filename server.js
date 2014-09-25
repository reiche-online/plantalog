var express =  require('express'),
    passport = require('passport'),
    passportLocal = require('passport-local'),
    app     = express();



//rewrites
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/css'));
app.use('/img', express.static(__dirname + '/client/img'));
app.use('/views', express.static(__dirname + '/client/views'));


//routing

app.get('/', function(req,res) {
   res.sendfile(__dirname + '/client/index.html');
});

app.get('/login', function(req,res) {
   res.sendfile(__dirname + '/client/login.html');
});

app.listen(5000, function() {
   console.log("Plantalog läuft Port 5000");
});