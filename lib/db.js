const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'ljack.pl',
    user: 'admin',
    password: 'admin12345',
    database: 'test'
});

connection.connect((err) => {
    if(err) {
        console.log('Error connecting: ' + err.stack);
        return;
    }
    console.log('Conected to server MySQL. Connected as ID: ' + connection.threadId);
});

module.exports = connection;