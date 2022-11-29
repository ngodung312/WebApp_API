const express = require('express');
const mysql = require('mysql');
const Joi = require('joi');
const app = express();

app.use(express.json());

// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// const db = mysql.createConnection({
//   host    : 'localhost', 
//   user    : 'root', 
//   password: '', 
//   database: 'demo_database'
// });

var pool  = mysql.createPool({
  host    : '217.21.74.51', 
  user    : 'u289965850_dung', 
  password: 'Dungbcu2022', 
  database: 'u289965850_bcu_demo'
});

exports.getUsers = function(callback) {
  pool.getConnection(function(err, connection) {
    if(err) { 
      console.log(err); 
      callback(true); 
      return; 
    }
    var sql = "SELECT * from User";
    connection.query(sql, [], function(err, results) {
      connection.release(); // always put connection back in pool after last query
      if(err) { 
        console.log(err); 
        callback(true); 
        return; 
      }
      callback(false, results);
    });
  });
};

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.get('/db/query', (req, res) => {
  let sql = 'SELECT * FROM User';
  pool.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Result: " + result);
    res.send(`Command: ${sql};  Result: ${result}!`)
  });
});

app.post('/db/add-user', (req, res) => {
  const { error } = validateNewUser(req.body); // get result.error
  if (error) return res.status(400).send(error.details[0].message);

  const newUser = {
    full_name: req.body.full_name, 
    email_address: req.body.email_address 
  }

  let sql = `INSERT INTO User (full_name, email_address) VALUES ("${newUser['full_name']}","${newUser['email_address']}")`;
  pool.query(sql, (err, result) => {
    if (err) throw err;
    console.log("User added: ", result);
    res.send(`New user has been added:\n${newUser.full_name}`);
  });
});

function validateNewUser(user) {
  const schema = Joi.object({
    full_name: Joi.string().min(3).required(),
    email_address: Joi.string().required().email({ tlds: { allow: false } })
  });
  return schema.validate(user);
}

