var app = require('express').Router();
var db = require('../db');

module.exports = app;

app.get('/', function(req, res, next){
  res.render('users');
});

app.post('/', function(req, res, next){
  db.createUser(req.body)
    .then(function(user){
      if(user.is_manager){
        return res.redirect('/users/managers');
      }
      return res.redirect('/users');
    });
});

app.delete('/:id', function(req, res, next){
  db.deleteUser(req.params.id*1)
    .then(function(){
      res.redirect('/users');
    })
    .catch(next);
});

app.put('/:id', function(req, res, next){
  db.updateUser(req.body)
    .then(function(user){
      res.redirect(user.is_manager ? '/users/managers' : '/users');
    })
    .catch(next);
});

app.get('/managers', function(req, res, next){
  res.render('managers');
});
