var {User} = require('./../models/user');

// Create a middleware function that we can use with our routes
var authenticate = (req, res, next) => {
  /* fetch token from request header */
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
      if (!user) {
        return Promise.reject();
      }
    /*Set user and token on request ojbect */
    req.user = user;
    req.token = token;
    next(); /* fires the callback function in the 3rd parameter of the route */
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
