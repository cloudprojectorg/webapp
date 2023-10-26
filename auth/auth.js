const { User } = require('../Models');
const bcrypt = require('bcrypt');

//Authenticate the user
exports.authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        //Missing authentication header
        return res.status(401).json({ error: 'Missing Authorization Header' });
    }


    //base64 credentials authentication
    const base64Credentials = authHeader.split(' ')[1];
    //checking the email and password
    const [email, password] = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');

    //try to find the user
    User.findOne({ where: { email } }).then(user => {
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //compare the password for the user
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                //Error comparing passwords
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            //check result for the user
            if (result) {
                req.user = user;
                next();
            } else {
                //incorrect password
                return res.status(401).json({ error: "Incorrect password" });
            }
        });
    });
};

//Login Method
exports.login = (req, res) => {
    const { email, password } = req.body;

    //try to find the user with email
    User.findOne({ where: { email } }).then(user => {
        if (!user) {
            //user not found 404
            return res.status(404).json({ error: "User not found" });
        }

        //bycrypt the password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                //error comapring passwords
                console.error("Error comparing passwords:", err);
                //internal server error
                return res.status(500).json({ error: "Internal Server Error" });
            }

            if (result) {
                const base64Credentials = Buffer.from(`${email}:${password}`).toString('base64');
                return res.json({ credentials: `Basic ${base64Credentials}` });
            } else {
                //incorrect password 401
                return res.status(401).json({ error: "Incorrect password" });
            }
        });
    });
};
