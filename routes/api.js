var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Proszę podać login i hasło.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Login zajęty.'});
      }
      res.json({success: true, msg: 'Udało się zarejestrować!'});
    });
  }
});

router.post('/signin', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Brak autentykacji.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Brak autentykacji.'});
        }
      });
    }
  });
});

router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  console.log(req.body);
  var newBook = new Book({
    isbn: req.body.isbn,
    title: req.body.title,
    author: req.body.author,
    publisher: req.body.publisher
  });

  newBook.save(function(err) {
    if (err) {
      return res.json({success: false, msg: 'Save book failed.'});
    }
    res.json({success: true, msg: 'Successful created new book.'});
  });
});

router.get('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  Book.find(function (err, books) {
    if (err) return next(err);
    res.json(books);
  });
});

module.exports = router;
