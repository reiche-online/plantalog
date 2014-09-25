var express =  require('express'),
    passport = require('passport'),
    passportLocal = require('passport-local'),
    app     = express();



//rewrites
app.use('/js', express.static(__dirname + '/client/frontend/js'));
app.use('/css', express.static(__dirname + '/client/frontend/css'));
app.use('/img', express.static(__dirname + '/client/frontend/img'));
app.use('/views', express.static(__dirname + '/client/frontend/views'));


//routing

app.get('/', function(req,res) {
   res.sendfile(__dirname + '/client/frontend/index.html');
});

app.get('/login', function(req,res) {
   res.sendfile(__dirname + '/client/frontend/login.html');
});

app.listen(5000, function() {
   console.log("Plantalog läuft Port 5000");
});