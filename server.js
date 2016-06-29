//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var express = require('express');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var VoteClass = require("./models/vote.js");
var UserClass = require("./models/user.js");

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'client')));

router.set('view engine', 'jade');
router.set('views', process.cwd() + '/client');

var User = new UserClass();
var Votes = new VoteClass();
// initial vote
Votes.create('BigMac or Pizza', [{
  id: 'input-0',
  option: 'BigMac',
  count: 10
}, {
  id: 'input-1',
  option: 'Pizza',
  count: 12
}], 'default');
Votes.create('Girl or Boy', [{
  id: 'input-0',
  option: 'Girl',
  count: 10
}, {
  id: 'input-1',
  option: 'Boy',
  count: 12
}], 'default');

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
    user: req.user,
    votes: Votes.listAll()
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

router.get('/vote/:id', function(req, res) {
  var voteId = req.params.id;
  var vote = Votes.getById(voteId);
  var datalist = [];
  var optionlist = [];
  for (var i = 0; i < vote.options.length; i++) {
    var o = vote.options[i];
    datalist.push('' + o.count);
    optionlist.push('"' + o.option + '"');
  }
  res.render('vote', {
    user: req.user,
    vote: vote,
    dataString: datalist.join(','),
    optionString: optionlist.join(',')
  });
});

router.post('/vote/:id', function(req, res) {
  var voteId = req.params.id;
  var optionid = req.body.select;

  Votes.vote(voteId, optionid);
  res.redirect('/vote/' + voteId)
});


router.get('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.render('create', {
    user: req.user
  });
});

router.get('/delvote/:id', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var voteId = req.params.id;
  Votes.delete(voteId, req.user.username);
  res.redirect('/my')
});

router.post('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  console.log(req.body);
  var title = '',
    options = [];
  for (var k in req.body) {
    if (k == 'title') {
      title = req.body[k];
    }
    else if (k.startsWith('input-')) {
      options.push({
        id: k,
        option: req.body[k],
        count: 0
      })
    }
  }
  var author = req.user.username;
  Votes.create(title, options, author);
  res.redirect('/');
});

router.get('/my', require('connect-ensure-login').ensureLoggedIn(),  function(req, res) {
  res.render('my', {
    user: req.user,
    votes: Votes.listAll(req.user.username)
  });
});

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
