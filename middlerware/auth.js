const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Please log in'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        error: ' token no longer exists.'
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'token no valid'
    });
  }
};