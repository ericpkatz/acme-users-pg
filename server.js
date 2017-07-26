var express = require('express');
var swig = require('swig');
swig.setDefaults({ cache: false });
var path = require('path');

var db = require('./db');

var app = express();
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('method-override')('_method'));

app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

app.set('view engine', 'html');
app.engine('html', swig.renderFile);


app.use(function(req, res, next){
  res.locals.path = req.url;
  db.getUsers(false, function(err, users){
    res.locals.users = users;
    db.getUsers(true, function(err, managers){
      res.locals.managers = managers;
      next();
    });
  });
});

app.get('/', function(req, res, next){
  res.render('index');
});

app.use('/users', require('./routes/users')); 


app.use(function(err, req, res, next){
  res.render('error', { error: err });
});


var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log(`listening on port ${port}`);
  db.sync(function(err){
    if(err){
      return console.log(err.message);
    }
    db.seed(function(err){
      if(err){
        return console.log(err.message);
      }
      db.getUsers(false, function(err, users){
        if(err){
          return console.log(err.message);
        }
        console.log(users);
        db.getUsers(true, function(err, users){
          if(err){
            return console.log(err.message);
          }
          console.log(users);
        });
      });
    });
  });
});
