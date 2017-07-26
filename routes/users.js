var app = require('express').Router();
var db = require('../db');

module.exports = app;

app.get('/', function(req, res, next){
  res.render('users');
});

app.post('/', function(req, res, next){
  db.createUser(req.body, function(err, user){
    if(err){
      return next(err);
    }
    if(user.is_manager){
      return res.redirect('/users/managers');
    }
    return res.redirect('/users');
  });
});

app.delete('/:id', function(req, res, next){
  db.deleteUser(req.params.id*1, function(err){
    if(err){
      return next(err);
    }
    return res.redirect('/users');
  });
});

app.put('/:id', function(req, res, next){
  db.updateUser(req.body, function(err, user){
    if(err){
      return next(err);
    }
    res.redirect(user.is_manager ? '/users/managers' : '/users');
  });
});

app.get('/managers', function(req, res, next){
  res.render('managers');
});
