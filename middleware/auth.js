
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
      console.log(token);

    if (!token) {
        return res.status(403).json({ msg: "No token provided" });
    }

    try {
        const key = "Nethra"; 
        console.log(key);
        const decoded = jwt.verify(token, key);  

        User.findByPk(decoded.userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                req.user = user;  
                next(); 
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ msg: 'Failed to authenticate token' });
            });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ msg: 'Unauthorized access, invalid or expired token' });
    }
};

module.exports = authenticate;