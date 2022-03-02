const { mysql } = require('./includes');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'nemecportfolio'
});

conn.connect((err) => {
    console.log('Database successfully connected to local server..');
});


module.exports = {conn};