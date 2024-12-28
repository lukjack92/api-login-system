const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/router');
const middelwareLogging = require('./middelware/logs');
const cookieParser = require('cookie-parser')
const app = express();
const secretKeyCookie = 'mySecurityCookieKey'
require('dotenv').config()

//Set up port
const PORT = process.env.PORT || 3001;

app.use(middelwareLogging.logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());
app.use(cookieParser(secretKeyCookie));
//app.use(cors({orgin: 'http:/localhost:'+`${PORT}`}));

//Add routes
app.get('/', function (req, res) {
    res.send('API - SYSTEM LOGIN');
});

app.use('/api', router);

//Run server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));