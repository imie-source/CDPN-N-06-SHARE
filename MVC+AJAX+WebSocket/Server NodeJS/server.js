/*
TODO : https://www.terlici.com/2014/09/29/express-router.html
Notes :
http://www.w3schools.com/html/html_colornames.asp
*/
var express = require('express')
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var io = require('socket.io')(server);
var router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.json()); // used to parse JSON object given in the request body
var cors = require('cors');
router.use(cors());
var async = require('async');


app.use('/data', router);
app.use('/ihm', express.static('static'));

//var Oriento = require('oriento');

/*var provideDB = function() {
  var server = Oriento({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'ekologia'
  });
  var db = server.use({
    name: 'ekologia',
    username: 'admin',
    password: 'admin'
  });
  return db;
}*/
var securityKey = 'KNNaG3ONbKo7nmQ-Ca8d3eSNU8JfAs-P';
var domain = 'api.mlab.com';
var collections = '/api/1/databases/cdi12/collections/';
var getAllScoreParameter = function() {
  return {
    hostname: domain,
    path: collections + 'score?apiKey=' + securityKey,
    method: 'GET'
  };
};

var postOnScoreParameter = function() {
  return {
    hostname: domain,
    path: collections + 'score?apiKey=' + securityKey,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
};
var sockects = [];
io.on('connection', function(socket) {
  console.log('connection');
  sockects.push(socket);
  socket.on('getAllScore', function(data) {
    /*db.select().from('orga').all().then(function(results) {
      socket.emit('getAllOrgaResponse', results);
    });*/
  });
  socket.on('addScore', function(data) {
    /*var db = provideDB();
    db.insert().into('orga').set(data).one().then(function(results) {
      socket.emit('addOrgaResponse', results);
    });*/
    sockects.forEach(function(socketIteration) {
      socketIteration.emit('', {});
    })
  });
});

server.listen(process.env.PORT || 8080, process.env.IP || "172.16.28.144", function() {
  console.log('Listening on port ');
  console.log(process.env.PORT || 8080);
})

var achieveScore = function(score, callback) {
  score.id = score._id.$oid;
  delete score._id;
}

router.get('/score/', function(req, res) {
  console.log('GET ALL');
  var bodyChunks = [];
  var output = '';
  //recherche de personne et alimentation de la promotion en série
  async.series([
      function(callback) {
        console.log(getAllScoreParameter());
        var reqGet = https.request(getAllScoreParameter(), function(resAPI) {
          resAPI.on('data', function(chunk) {
            output += chunk;
          })
          resAPI.on('end', function() {
            bodyChunks = JSON.parse(output);
            //passage à la deuxième fonction en série
            callback();
          });
        });
        reqGet.on('error', function(e) {
          console.error(e);
          callback();
          //return next(e);
        });
        reqGet.end();
      }
    ],
    function(err) { //This function gets called after the two tasks have called their "task callbacks"
      //console.log(err)
      //fonction de fin de série
      if (err) return next(err);
      //retour json de la variable construite au fur et à mesure
      for (item of bodyChunks) {
        achieveScore(item);
      }
      console.log(bodyChunks);
      res.json(bodyChunks);
    });
});

router.post('/score/', function(req, res) {
  console.log('POST ONE');
  var bodyChunks = [];
  var output = '';
  var score = {};
  if (req.body.player) {
    score.player = req.body.player
  }
  if (req.body.score) {
    score.score = req.body.score
  }
  //recherche de personne et alimentation de la promotion en série
  async.series([
      function(callback) {
        console.log(postOnScoreParameter());
        var reqGet = https.request(postOnScoreParameter(), function(resAPI) {
          resAPI.on('data', function(chunk) {
            //console.log(chunk.toString('utf8'));
            output += chunk;
          })
          resAPI.on('end', function() {
            //console.log(output);
            bodyChunks = JSON.parse(output);
            //passage à la deuxième fonction en série
            callback();
          });
        });
        reqGet.on('error', function(e) {
          console.error(e);
          //return next(e);
        });
        reqGet.write(JSON.stringify(req.body));
        reqGet.end();
      }
    ],
    function(err) { //This function gets called after the two tasks have called their "task callbacks"
      //console.log(err)
      //fonction de fin de série
      if (err) return next(err);
      console.log(bodyChunks);
      achieveScore(bodyChunks);

      sockects.forEach(function(socketIteration) {
        socketIteration.emit('newScore', bodyChunks, function() {
          console.log('CONFIRMATION')
        });
      })

      //retour json de la variable construite au fur et à mesure
      console.log(bodyChunks);
      res.json(bodyChunks);
    });
});
