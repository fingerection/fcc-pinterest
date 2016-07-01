//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var express = require('express');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var UserClass = require("./models/user.js");
var ImageClass = require("./models/image.js");

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'client')));

router.set('view engine', 'jade');
router.set('views', process.cwd() + '/client');

var User = new UserClass();
var ImageStore = new ImageClass();

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

passport.use(new TwitterStrategy({
    consumerKey: 'kymbvbHBcTYXGfLEjQTywzBYJ',
    consumerSecret: 'pgpn8aGoDvlz0LU6Xf9JW2zOQRY9WXWWaoARpkEjwPC7Osjxxa',
    callbackURL: 'https://fcc-pinterest-fingerection.c9users.io/twitter_callback'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

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


var urls = ['http://img4.imgtn.bdimg.com/it/u=3730363120,438618708&fm=21&gp=0.jpg',
'http://img1.imgtn.bdimg.com/it/u=3495037814,4039729047&fm=21&gp=0.jpg',
'http://img1.imgtn.bdimg.com/it/u=1133494587,246370114&fm=21&gp=0.jpg',
'http://img1.imgtn.bdimg.com/it/u=2908942533,263269990&fm=21&gp=0.jpg',
'http://img1.imgtn.bdimg.com/it/u=3495037814,4039729047&fm=21&gp=0.jpg'];
// initial image
for(var i=0; i<urls.length; i++) {
  ImageStore.create('Image '+i, urls[i], 'admin');
}

router.get('/', function(req, res) {
  var images = ImageStore.getAll();
  res.render('index', {
    user: req.user,
    images: images
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

router.get('/twitter_login',
  passport.authenticate('twitter'));

router.get('/twitter_callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

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
  
router.get('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.render('create', {
    user: req.user
  });
});

router.post('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var title = req.body.title, url = req.body.url;
  var author = req.user.username;
  ImageStore.create(title, url, author);
  res.redirect('/');
});

router.get('/my', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var author = req.user.username;
  var images = ImageStore.getAll(author);
  res.render('my', {
    user: req.user,
    images: images
  });
});

router.post('/my', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var action = req.body.action;
  var imageid = req.body.imageid;
  var author = req.user.username;
  if (action == 'delete'){
    ImageStore.delete(imageid, author);
  }
  res.redirect('/my');
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
