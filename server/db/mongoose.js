// *****************************************************************************
// This is the mongoose project configuration file
// *****************************************************************************
var mongoose = require('mongoose');

// Mongooose configuration
mongoose.Promise = global.Promise;    // Tell mongoose we are using in-built promise library
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose: mongoose
};


// in ES6 you can following syntax is the same as above
//               module.exports = {mongoose};
