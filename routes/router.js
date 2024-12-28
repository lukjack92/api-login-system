const express = require('express');

//const router = express.Router();
const router = express();

const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const mysql = require('../lib/db');
const userMiddelware = require('../middelware/users');
require('dotenv').config()

const cookieConfig = {
  httpOnly: true,
  maxAge: 1800000,
  //signed: true
}

let refreshTokens = [];

router.get('/', (req, res) => {
    res.send('Welcome in API');
});

router.post('/sign-up', userMiddelware.validateRegister, (req, res, next) => {
    mysql.query(
        `SELECT id FROM users WHERE LOWER(username) = LOWER(${mysql.escape(
          req.body.username
        )});`,
        (err, result) => {
          if (result.length) {
            return res.status(409).send({
              msg: 'This username is already in use!'
            });
          } else {
            // Username is available
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                return res.status(500).send({
                  msg: err
                });
              } else {
                // Has hashed pw => add to database
                mysql.query(
                  `INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}', ${mysql.escape(
                    req.body.username
                  )}, ${mysql.escape(hash)}, now())`,
                  (err, result) => {
                    if (err) {
                      return res.status(400).send({
                        //msg: err.code + " " + err.errno 
                        msg: err
                      });
                    }
                    return res.status(201).send({
                      msg: 'Registered!'
                    });
                  }
                );
              }
            });
        }
  });
});

router.post('/login', (req, res, next) => {
    mysql.query(`SELECT * FROM users WHERE username = ${mysql.escape(req.body.username)};`,
    (err, result) => {
        // User doesn't exist
        if(err) {
            return res.status(400).send({
                msg: err
            });
        }

        if(!result.length) {
            return res.status(401).send({
                msg: 'Username or password is incorrect!'
            });
        }

        // Check password
        bcrypt.compare(
            req.body.password,
            result[0].password,
            (bErr, bResult) => {
                if(bErr){
                    return res.status(401).send({
                        msg: 'Username or password is incorrect!'
                    });
                }

                if(bResult) {
                    const accessToken = jwt.sign({
                      username: result[0].username,
                      userId: result[0].id
                    },
                    process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '40s'
                    });

                    const refreshToken = jwt.sign({
                      username: result[0].username,
                      userId: result[0].id
                    },
                    process.env.REFRESH_TOKEN_SECRET)

                    mysql.query(
                        `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
                    );
                    refreshTokens.push(refreshToken);
                    console.log(refreshTokens);

                    res.cookie('token',accessToken, cookieConfig);
                    res.cookie('refreshToken',refreshToken, cookieConfig);

                    return res.status(200).send({
                        msg: 'Logged in!',
                        accessToken,
                        refreshToken
                        //user: result[0]
                    });
                }
                return res.status(401).send({
                    msg: 'Username or password is incorrect!'
                })
            }
        );
    });
});

router.post('/refreshToken', (req, res) => {
  const refreshToken = req.body.token
  if(!refreshToken) return res.sendStatus(400)
  if(!refreshTokens.includes(refreshToken)) return res.sendStatus(400)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(500).send({
      mgs: "Internal Server Error"
    })
    const accessToken = jwt.sign({
      username: user.username,
      userId: user.id
    },
    process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '40s'
    });
    res.status(200).send({
      accessToken: accessToken
    })
  }) 
});

router.delete('/logout', (req, res) => {
    if(!req.body.token || req.body.token == null) {
      return res.json({
        msg: "Token is regired!"
      })
    }

    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    console.log("Refresh Token: " + refreshTokens)
    return res.json({
      msg: "Successfully deleted!"
    });
});

router.get('/secret-route', userMiddelware.isLoggedIn, (req, res, next) => {
  res.send("This is the secret content. Only logged in users can see that!");
});

router.get('/set-cookie', (req, res) => {
  res.cookie('myCookie','secretCookie',cookieConfig);
  res.send('Cookie set successfully');
});

router.get('/read-cookie', (req, res) => {
  res.send("Value of cookie: " + req.cookies.myCookie)
  console.log(req.cookies)
})

router.get('/delete-cookie', (req, res) => {
  res.clearCookie('myCookie');
  res.send('Cookie deleted successfull')
})

router.get('/delete-tokens', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.send('Tokens deleted successfull')
})

module.exports = router;