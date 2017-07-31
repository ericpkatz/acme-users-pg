var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);

client.connect(function(err){
  if(err){
    console.log(err.message);
  }
});

function query(sql, params){
  return new Promise(function(resolve, reject){
    client.query(sql, params, function(err, result){
      if(err){
        return reject(err);
      }
      resolve(result);
    });
  });
}

function sync(){
  var sql = `
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name character varying(255) UNIQUE NOT NULL,
      is_manager BOOLEAN DEFAULT false NOT NULL,
      CHECK (name <> '')
    );
  `;
  return query(sql, null);
}

function createUser(user){
  user.is_manager = !!user.is_manager;
  console.log(user.is_manager);
  return query('insert into users (name, is_manager) values ($1, $2) returning id', [user.name, user.is_manager])
    .then(function(result){
      return getUser(result.rows[0].id);
    });
}

function updateUser(user){
  return getUser(user.id)
    .then(function(_user){
      if(!_user){
        throw new Error('user not found');
      }
      Object.assign(_user, user);
      var sql = `
        UPDATE users
        SET name = $1, is_manager = $2
        WHERE id = $3
        RETURNING id;
      `;
      var params = [ _user.name, _user.is_manager, _user.id];
      return query(sql, params);
    })
    .then(function(result){
      return getUser(result.rows[0].id);
    });
}

function deleteUser(id){
  return query('delete from users where id = $1', [ id ]);
}

function seed(){
  return Promise.all([
    createUser({ name: 'moe', is_manager: true}),
    createUser({ name: 'larry', is_manager: true}),
    createUser({ name: 'curly', is_manager: true}),
  ]);
}

function getUsers(onlyManagers){
  var sql = `
    SELECT *
    FROM users
    ${ onlyManagers ? 'WHERE is_manager = true' : ''};
  `;
  return query(sql, null)
    .then(function(result){
      return result.rows;
    });
}

function getUser(id){
  return query('SELECT * from users where id = $1', [id])
    .then(function(result){
      return result.rows.length ? result.rows[0] : null;
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
