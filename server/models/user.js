var mongoose = require('mongoose');

// Create a user Model (pass in the name and an object describing the model)
var User = mongoose.model('users', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});


module.exports = {User};
