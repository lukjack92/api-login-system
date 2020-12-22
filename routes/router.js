const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const mysql = require('../lib/db');
const userMiddelware = require('../middelware/users');

router.get('/', (req, res) => {
    res.send('Welcome in API');
});

router.post('/sign-up', userMiddelware.validateRegister, (req, res, next) => {
    mysql.query(
        `SELECT * FROM identities WHERE LOWER(username) = LOWER(${mysql.escape(
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
                  `INSERT INTO identities (id, userName, password, registered) VALUES ('${uuid.v4()}', ${mysql.escape(
                    req.body.username
                  )}, ${mysql.escape(hash)}, now())`,
                  (err, result) => {
                    if (err) {
                      return res.status(400).send({
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
    mysql.query(`SELECT * FROM identities WHERE username = ${mysql.escape(req.body.username)};`,
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
                    const token = jwt.sign({
                        username: result[0].username,
                        userId: result[0].id
                    },
                    'secretcodeLJ', {
                        expiresIn: '1m'
                    });

                    mysql.query(
                        `UPDATE identities SET lastLogin = now() WHERE id = '${result[0].id}'`
                    );
                    
                    return res.status(200).send({
                        msg: 'Logged in!',
                        token,
                        user: result[0]
                    });
                }
                return res.status(401).send({
                    msg: 'Username or password is incorrect!'
                })
            }
        );
    });
});

router.get('/secret-route', userMiddelware.isLoggedIn, (req, res, next) => {
    res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = router;