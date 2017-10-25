const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Create a user Model (pass in the name and an object describing the model)
//  unique: true ensures user email is unique within the user collection
//  Note that email validation is using mongoosejs validators framework.
//  See mongoosejs.com for framework details. The actual validator libary
//  can be found on npm on https://www.npmjs.com/package/validator

var UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Below we can define our own instance methods or override certain methods.
// For example generateAuthToken is a custom method, while toJSON overrides
// the default behavior of sending back entire user object.

// Override existing toJSON object
UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject(); /* converts mongoose user to a regular object*/

  return _.pick(userObject, ['_id', 'email']); /* strips out password and token array*/
}

// Add my own method to generate auth token
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'secretval').toString();
  console.log(`==> generateAuthToken`);
  console.log(`    JWT token value signed: ${token}`);

  /* populate tokens array in the UserSchema with an object that has access
  and token properties set */
  user.tokens.push({access, token});

  /* Return a user.save promise, that returns a token. The token value
   will be passed as success argument to the next then() call in the
   promise chain. When you look at server.js, it seems that user.save()
   is executed 2x's, which is not the case.*/
  return user.save().then((token) => {
      return token;
  }); /* normally you can tack on another then here. Instead, we return
     it so we can chain a then in server.js and passing token as result value */
};

var User = mongoose.model('users', UserSchema);

// Below is an expanded version of the validator. you can use the abbreviated
// version above, or expanded version below
// var User = mongoose.model('users', {
//   email: {
//     type: String,
//     required: true,
//     validate: {
//       validator: (value) => {
//         return validator.isEmail(value);
//       },
//       message: '{VALUE} is not a valid email'
//     }
//   }
// });

module.exports = {User};
