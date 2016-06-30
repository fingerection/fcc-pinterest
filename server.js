//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

var express = require('express');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var UserClass = require("./models/user.js");
var GoingClass = require("./models/going.js");

var router = express();
var server = http.createServer(router);

var io = socketio.listen(server);
var sockets = [];
var symbols = {symbols: ['AAPL']};

io.on('connection', function(socket) {
  console.log('connect');
  sockets.push(socket);
  socket.emit('message', symbols);

  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
  });

  socket.on('message', function(msg) {
    console.log(msg);
    symbols = {symbols: msg};
    broadcast('message', symbols);
  });
});

function broadcast(event, data) {
  sockets.forEach(function(socket) {
    socket.emit(event, data);
  });
}

router.use(express.static(path.resolve(__dirname, 'client')));

router.set('view engine', 'jade');
router.set('views', process.cwd() + '/client');

var User = new UserClass();
var Going = new GoingClass();

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne(username, function(err, user) {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('user is null');
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      if (!user.validPassword(password)) {
        console.log('password is not valid')
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      console.log('done');
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
  cb(null, user);
});

router.use(require('express-session')({
  secret: 'justlikethestar',
  resave: false,
  saveUninitialized: false
}));


router.use(cookieParser());
router.use(bodyParser());
router.use(passport.initialize());
router.use(passport.session());

router.get('/', function(req, res) {
  res.render('index', {
    user: req.user
  });
});

router.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
  })
);

router.get('/signup', function(req, res) {
  res.render('signup', {
    user: req.user,
    message: ""
  });
});

router.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (User.isExist(username)) {
    res.render('signup', {
      user: req.user,
      message: "user exists"
    });
  }
  else {
    User.create(username, password);
    res.redirect('/login');
  }
});

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });
  
var yelp = require('./yelp.js');

router.get('/api/search/:keyword', function(req, res) {
	var keyword = req.params.keyword;
	var offset = req.query.offset || "0";
	var limit = req.query.limit || "20";
	
  yelp.request_yelp({location: keyword, category_filter:'bars', offset: offset, limit: limit}, function(err, response, body){
    if(err) {
      res.send('err'+err.toString());
      return;
    }
    var bodyObj = JSON.parse(body);
    var result = [];
    if(bodyObj.businesses === undefined) {
      res.send([]);
      return;
    }
    for(var i=0; i<bodyObj.businesses.length; i++) {
      var business = bodyObj.businesses[i];
      var username = '';
      if (req.user) {
        username = req.user.username;
      }
      var info = Going.getStatus(business.id, username);
      result.push({
        imgurl: business.image_url,
        id: business.id,
        name: business.name,
        total: info.total,
        status: info.goingStatus
      });
    }
    res.send(result);
  });
});

router.get('/api/dogoing/:barid', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var barId = req.params.barid;
  Going.doGoing(barId, req.user.username);
  res.send({status: "1"});
});

router.get('/api/ungoing/:barid', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var barId = req.params.barid;
  Going.unGoing(barId, req.user.username);
  res.send({status: "1"});
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
