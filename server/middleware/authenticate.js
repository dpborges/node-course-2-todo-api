var {User} = require('./../models/user');

var dpbutil = require('../../server/db/dpbutils.js');
const filename = dpbutil.pluckFilename(__filename, __dirname);

// Middleware function that autheticates a user request by checking to see if
// user's token exists in the database.
var authenticate = (req, res, next) => {

  /* fetch token from request header */
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject({message: 'AuthFailure'});
    }

    /*Set user and token on request ojbect */
    req.user = user;
    req.token = token;
    next(); /* fires the callback function in the 3rd parameter of the route */
            /* You only want to fire the callback, if you found the user. */
  }).catch((e) => {
    var errorType = dpbutil.getErrorType(e);
    switch(errorType) {
     case 'InvalidAuthToken':
        errmsg = `InvalidAuthToken, unable to verify signed token from '${req.hostname}:${req.path}'' `;
        dpbutil.logerror(filename, errmsg)
        res.status(401).send({errmsg});
        break;
     case 'AuthFailure':
        errmsg = `AuthFailure, unable to authenticate request. Did not find matching token sent from '${req.hostname}:${req.path}' `;
        dpbutil.logerror(filename, errmsg)
        res.status(401).send({errmsg});
        break;
     case 'UncaughtException':
        errmsg = `UncaughtException while trying to authenticate request from '${req.hostname}:${req.path}'  `;
        dpbutil.logerror(filename, errmsg)
        res.status(401).send({errmsg});
        break;
     default:
        dpbutil.logerror(filename, e)
        res.status(401).send(e);
    }
  });
};

module.exports = {authenticate};
