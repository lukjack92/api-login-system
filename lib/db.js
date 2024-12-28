const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'mysql.mikr.us',
    user: 'e217',
    password: '24D7_6fbec9',
    database: 'db_e217'
});

connection.connect((err) => {
    if(err) {
        console.log('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Conected to server MySQL. Connected as ID: ' + connection.threadId);    
});

module.exports = connection;
