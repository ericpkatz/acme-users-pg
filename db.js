var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);

client.connect(function(err){
  if(err){
    console.log(err.message);
  }
});

function query(sql, params,cb){
  client.query(sql, params, cb);
}

function sync(cb){
  var sql = `
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name character varying(255) UNIQUE NOT NULL,
      is_manager BOOLEAN DEFAULT false NOT NULL,
      CHECK (name <> '')
    );
  `;
  query(sql, null, function(err){
    if(err){
      return cb(err);
    }
    cb(null);
  });
}

function createUser(user, cb){
  user.is_manager = !!user.is_manager;
  query('insert into users (name, is_manager) values ($1, $2) returning id', [user.name, user.is_manager], function(err, result){
    if(err){
      return cb(err);
    }
    getUser(result.rows[0].id, function(err, user){
      if(err){
        return cb(err);
      }
      cb(null, user);
    });
  });
}

function updateUser(user, cb){
  getUser(user.id, function(err, _user){
    if(err){
      return cb(err);
    }
    if(!_user){
      return cb(new Error('user not found'));
    }
    Object.assign(_user, user);
    var sql = `
      UPDATE users
      SET name = $1, is_manager = $2
      WHERE id = $3
    `;
    var params = [ _user.name, _user.is_manager, _user.id];
    query(sql, params, function(err){
      if(err){
        return cb(err);
      }
      getUser(_user.id, function(err, user){
        if(err){
          return cb(err);
        }
        cb(null, user);
      });
    });
  });
}

function deleteUser(id, cb){
  query('delete from users where id = $1', [ id ], function(err){
    if(err){
      return cb(err);
    }
    cb(null);
  });
}

function seed(cb){
  createUser({ name: 'moe', is_manager: true}, function(err){
    if(err){
      return cb(err);
    }
    createUser({ name: 'larry', is_manager: true}, function(err){
      if(err){
        return cb(err);
      }
      createUser({ name: 'curly', is_manager: false}, function(err){
        if(err){
          return cb(err);
        }
      });
      cb(null);
    });
  });
}

function getUsers(onlyManagers, cb){
  var sql = `
    SELECT *
    FROM users
    ${ onlyManagers ? 'WHERE is_manager = true' : ''};
  `;
  query(sql, null, function(err, result){
    if(err){
      return cb(err);
    }
    cb(null, result.rows);
  });
}

function getUser(id, cb){
  query('SELECT * from users where id = $1', [id], function(err, result){
    if(err){
      return cb(err);
    }
    cb(null, result.rows[0]);
  });
}


module.exports = {
  sync,
  seed,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
