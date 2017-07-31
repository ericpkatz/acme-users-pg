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
  Promise.all([
    db.getUsers(true),
    db.getUsers(false),
  ])
  .then(function(result){
    res.locals.managers = result[0];
    res.locals.users = result[1];
    next();
  })
  .catch(next);
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
  db.sync()
    .then(function(){
      return db.seed();
    })
    .then(function(){
      return db.getUsers();
    })
    .then(function(users){
      console.log(users);
    });
});
