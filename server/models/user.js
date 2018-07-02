const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var   dpbutil = require('../../server/db/dpbutils.js');
const filename = dpbutil.pluckFilename(__filename, __dirname);

/* ********************************************************************************** */
// Create a user Model (pass in the name and an object describing the model)
//  unique: true ensures user email is unique within the user collection
//  Note that email validation is using mongoosejs validators framework.
//  See mongoosejs.com for framework details. The actual validator libary
//  can be found on npm on https://www.npmjs.com/package/validator
/* ********************************************************************************** */
var UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    lowercase: true,
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
},
{
  timestamps: true
});

/* ********************************************************************************** */
/* Below we can define our own instance methods for introducing custom functionality  */
/* or overriding certain mongoose method behavior. See genAuthToken and toJSON below  */
/* ********************************************************************************** */

// Override existing mongoose toJSON method behavior that is called by mongoose.
// This will strip out Secure fields you do not want to send back to client via send,
// like password, internal object id, tokens array, etc.
UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject(); /* converts mongoose user to a javascript object*/

  return _.pick(userObject, ['_id', 'email']); /* strips out password and token array
                                                  by picking off only id and password*/
}

// Add  mongoose instance method to introduce custom functionality to generate
// an auth token. This will generate the jwt token,  add it to the tokens array,
// and return a promise that saves user object and token to database, and then
// returns the token, as part of the promise chain, after saving to database.
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';

  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);   /* populate tokens array in user schema  */

  // The user.save() promise saves the user document with the updated token, which in turn returns a token.
  // The token value  will be passed as success argument to the next then() call in the
  // promise chain in server.js.
  return user.save().then(() => {
      return token;  // Note, you can return a value as part of a Promise
  });
};

// Desc: This method is used when user wants to reset a password.
// Input: since this is an instance method, the instance document is used as input.
// The reason we create a separate method from generateAuthToken is because 1) we do
// not want to save the token in user document's token array, and 2) we would
// like to generate a one time token. We do this by combining user's existing
// password and createdAt timestamp (ticks), as the secret. Once the user
// changes password, this token will no longer be valid, since its based on
// the orginal password and createdAt timestamp.
UserSchema.methods.generateResetPasswordToken = function () {
  var user = this;

  var access = 'auth';
  var dateTicks = dpbutil.convertDateToTicks(user.createdAt);
  var resetPwSecret = user.password + dateTicks;

  var token = jwt.sign({key: user._id.toHexString(), access}, resetPwSecret).toString();
  // var token = encryptionKey;
  return token;  // Note, you can return a value as part of a Promise
};




// Remove token is called from the DELETE:/users/me/token route.
// The user object is initialized when the authenicate middleware method is fired.
UserSchema.methods.removeToken = function (token) {
  var user = this;        // user is set to UserSchema object.

  return user.update({    // This  updates database directly
      $pull: {            // Pull (actually deletes) token from array which matches token passed as arg
         tokens: {token}
      }
  });
};

// Below we define model method as apposed to an instance method.
// This method decodes token using secret key for purpose of checking whether token has been tampered with.
// Input: token
UserSchema.statics.findByToken =  function (token) {
  var User = this;
  var decoded;

  // Verify if token is valid
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e) {
    return Promise.reject({message: 'InvalidAuthToken'});
  }

  console.log('This is decoded id ' + JSON.stringify(decoded,null,2));

  // Return User object, with below criteria, if token was verified above
  return User.findOne({
    '_id': decoded._id,      /* assign user's object _id from decoded jwt token in header */
    'tokens.token': token,   /* assign the token passed in to this method */
    'tokens.access': 'auth'  /* assign access type */
  });
};


// Encrypt user password before saving to database. This is called before saving
// document to database. First parm 'save', is the mongoose save command.
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
      bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;  /* replaces plain text value in password property */
            next();
          });
      });
  } else {
    next();
  }
});

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
      if (!user) {    // if user does not exist, reject promise
       return Promise.reject({message: 'NoRecordFound'});
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject({message: `InvalidPassword, for Email ${email} `});
          }
        });
      });
  });
};

UserSchema.statics.emailAddressExist = function (emailAddress) {
  var User = this;

  return User.findOne({
    'email': emailAddress
  }); //.then((user) => {
  //   console.log(user);
  //   if (user) {
  //     resolve("FoundRecord");
  //   } else resolve("NoRecordFound");
  // }).catch((e) => {
  //    dpbutil.logerror(filename, `(method: emailAddressExist) - ${e}`)
  // })
};


var User = mongoose.model('users', UserSchema);

module.exports = {User};
