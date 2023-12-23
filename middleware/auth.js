const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = getToken(req.headers);
        console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, process.env.JWT_TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
      }
  
      // Attach decoded user information to the request
      req.user = decoded;
      next();
    });
  }


const getToken = function(headers) {
    if (headers && headers.authorization) {
        let parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = {
    verifyToken: verifyToken
};