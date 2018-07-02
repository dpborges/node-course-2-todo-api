// *****************************************************************************
// This is the mongoose project configuration file
// *****************************************************************************
var mongoose = require('mongoose');
var config = require('../../server/config/config.js')

// Mongooose configuration
mongoose.Promise = global.Promise;    // Tell mongoose we are using in-built promise library

const options = {
  autoIndex: true,   /* set to false, when in production */
  poolSize: 7,
  keepAlive: 120
}
mongoose.connect(process.env.MONGODB_URI, options);

console.log('MONGDB_URI ' + process.env.MONGODB_URI);

module.exports = {
  mongoose: mongoose
};


// in ES6 you can following syntax is the same as above
//               module.exports = {mongoose};
