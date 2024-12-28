const jwt = require('jsonwebtoken');

module.exports = {
    validateRegister: (req, res, next) => {
        // Username min length 3
        if(!req.body.username || req.body.username.length < 3) {
            return res.status(400).send({
                msg: 'Please enter a username with min 3 chars'
            });
        }

        // Password min 6 chars
        if(!req.body.password || req.body.password.length < 6) {
            return res.status(400).send({
                msg: 'Please enter a password with min 6 chars'
            });
        }

        // Password (repeat) does not match
        if(!req.body.password_repeat || req.body.password != req.body.password_repeat) {
            return res.status(400).send({
                msg: 'Both passwords must match'
            });
        }

        next();
    },

    isLoggedIn: (req, res, next) => {
        try{
            //const accessToken = req.headers.authorization.split(' ')[1];
            const accessToken = req.headers['authorization'];
            //const token = req.get('Authorization');
            //console.log(accessToken);
            const decoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
            //req.userData = decoded;
            //console.log(decoded);
            next();
        } catch (err) {
            console.log("Error: " + err.message);
            return res.status(401).send({
                msg: 'Your session is not valid!'
            });
        }
    }
};