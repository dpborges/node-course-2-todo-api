var express = require('express');
var bodyParser = require('body-parser'); // see comment below below app.use()
var {ObjectID} = require('mongodb');
var _ = require('lodash');
const jwt = require('jsonwebtoken');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var validator = require('validator');
const moment   = require("moment");

var dpbutil = require('../server/db/dpbutils.js');
var {sendMailWithBodyInline} = require('../server/dpbcommon/mailServices.js');

const filename = dpbutil.pluckFilename(__filename, __dirname);

var app = express();
const port = process.env.PORT || 3000; // If PORT env variable not set, it will use port 3000

// Configure middleware
// Body Parser lets us send json to the server and convert json to a javscript object
app.use(bodyParser.json());

/* ===================================================================================== */
/* USER MANAGEMENT API's                                                                 */
/* ===================================================================================== */

// The following public route is used to sign-up a user (aka registration).
// Input: JSON object with email and password.
// Step: 1) Pick off email and password from json request and create javascript object (body)
// Step: 2) Instantiate new user Object using body javascript object
// Step: 3) Encrypt password and save in database
// Step: 4) Generate JWT token, save in tokens array of user object, save token in db and have token returned as resolved promise
// Step: 5) Set x-auth property on header and respond to user with token
app.post('/users', (req, res) => {
    console.log('This is request body ' + JSON.stringify(req.body,null,2));
    var body = _.pick(req.body, ['email', 'password']); //Pick off select field from users request
    var user = new User(body); // This will set email and password on user schema object

    user.save().then(() => {   // Before save, encrypt password then saves user obj with encyrypted password
      return user.generateAuthToken(); // generate token, save to tokens array,and return promise that saves object, return token
    }).then((token) => {
      res.header('x-auth', token).send(user);  // set header x-auth property and return user object
    }).catch((e) => {
      var errorType = dpbutil.getErrorType(e)
      var errmsg = "";
      switch(errorType) {
       case 'DuplicateRecord':
          errmsg = `DuplicateRecord found in user collection for email ${user.email} `;
          dpbutil.logerror(filename, errmsg)
          res.status(400).send({errmsg});
          break;
       case 'EmailValidationError':
          errmsg = `EmailValidationError for email ${user.email}; check email format `;
          dpbutil.logerror(filename, errmsg)
          res.status(400).send({errmsg});
          break;
       case 'UncaughtException':
          errmsg = `UncaughtException during registration process for email ${user.email} `;
          dpbutil.logerror(filename, e)
          res.status(400).send(e);
          break;
       default:
          res.status(400).send(e);
      }
    })
});

// Desc: The following public route is used to login a user into the application
// Input: JSON object with email and password.
// Step: 1) Pick off email and password from json request and create javascript object (body)
// Step: 2) Check if email address is formatted correctly; if not, respond with a status code 400
// Step: 3) Look up user credentials using email address. Check password using bcrypt.compare()
//          If valid password, generate Auth token, save in database, and return to user within header
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  // Exit login request if user submitted invalid email address.
  if (!validator.isEmail(body.email)) {
    errmsg = `EmailValidationError for email ${body.email}; check email format `;
    dpbutil.logerror(filename, errmsg)
    res.status(400).send({errmsg});
    return;
  }

  User.findByCredentials(body.email, body.password).then((user) => {

    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);  /* x-auth indicates custom header */
    })

  }).catch((e) => {
    var errorType = dpbutil.getErrorType(e) || "none";
    var errmsg = "";
    switch(errorType) {
     case 'NoRecordFound':
        errmsg = `NoRecordFound for user ${body.email}`;
        dpbutil.logerror(filename, errmsg)
        res.status(400).send({errmsg});
        break;
     case 'UncaughtException':
        errmsg = `UncaughtException during user login with email ${body.email} `;
        dpbutil.logerror(filename, e)
        res.status(400).send(e);
        break;
     default:
        res.status(400).send(e);
    }
  })
});

// Desc: Private route that allows user to get their own user information.
// This route can only be called after user as logged in and token has been saved in database
// Input: The request requires setting x-auth header property and providing token value.
// Steps: Note that since this is private route, it takes 3 parameters.
// 1) the route itself, 2) a middleware function and  3) a call back function.
// The autheticate middleware function gets called automatically. When completed,  it calls next(),
// which ends up firing the callback function below. If authentication fails,
// it responds with an HTTP 401 (from authenticate) and will only fire callback if authentication was
// successfull and finds user with matching token
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// Desc: This is private route. It is used to log off a user, by deleting their x-auth token.
// Input: Auth token sent on request header
// The authenticate middleware is called first. If it finds a user with a matching
// token, its sets user property of the request object (req.user) to the matching user doc
// returned, and sets token property of the request object (req.token) to the
// validated token. Lastly, the callback function here is called, which deletes the token from
// user document that was returned by authenticate vi the user property of the request object (req.user)
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
      res.status(200).send();
    }, () => {
      res.status(400).send();
    })
});

// Desc: This route is called after user clicks the "forgot password" link on login page.
// That link will render a form for user to enter their email address. When they
// click submit, this route will be called.
// Input: Json body with email address.
// Steps: 1) pick off emailAddress,  2) Check if email was actually provided
// 3)  See if email is valid, 4) generate one time token, 5) construct url
// 6)  Send email with url that user can used to reset password
app.post('/passwordreset', function (req, res) {

     var toEmailAddress = req.body.email;

     if (!toEmailAddress) {                     // Check if email is provided in url
       res.status(400).send({errmsg: `InvalidRequest: Missing email address `});
       return;
     }

     if (!validator.isEmail(toEmailAddress)) {  // Check for proper email format
       errmsg = `EmailValidationError for email ${body.email}; check email format `;
       dpbutil.logerror(filename, errmsg)
       res.status(400).send({errmsg});
       return;
     }
     // Check if email address exist in database, if so, generate token from
     // user pasword and createAt date, to use as secret to JWT token. This token will
     // only work once, as when user changes password, either timestamp or password
     // will change and hence will not match token provide by
     User.emailAddressExist(toEmailAddress).then((user) => {
       if (user) {
            // Genearate token
            var token = user.generateResetPasswordToken();
            // Construct URL
            var resetPasswordUrl = `http://localhost:3000/resetpassword/${user.id}/${token}`;
            // Send email with url
            sendMailParams = {
                from: 'dpbsoftware@gmail.com',
                to:   ['dpborges@gmail.com'],
                urls: {
                  resetPasswordUrl
                }
            }
            sendMailWithBodyInline(sendMailParams).then((successMsg) => {
                res.status(200).send(successMsg);
            },
            (errmsg) => {
                res.status(200).send(errmsg);
            });
            return;
      } else {
            res.status(400).send({message: `Email address ${toEmailAddress} Does Not Exist in Database` });
            return;
      }
     })
 });


// Desc: This route is called when user clicks the link in the email sent to them
// to reset their password.
// Input: user id and one time token as part of the url.
// Steps: 1) Fetch user, 2) Obtain secret, 3) verify JWT token with secret ,
// 4) if token valid, render form for user to enter their password
 app.get('/resetpassword/:id/:token', function (req, res) {

   // Check if ID is valid
   if (!ObjectID.isValid(req.params.id)) {
     console.log("Id paramter invalid");
     res.status(400).send({errmsg: "Invalid ID " });
     return;
   }

   // Fetch user by id and verify if token is valid
    User.findOne({_id: req.params.id}).then((user)=> {
       if (user) {              // Found User

           // construct secret pasword from user password and createAt date/time (in ticks)
           var dateTicks = dpbutil.convertDateToTicks(user.createdAt);
           var resetPwSecret = user.password + dateTicks;

           // Verify if token is valid
           try {               // Token is valid ; render form
             decoded = jwt.verify(req.params.token, resetPwSecret);
             res.status(200).send("Found User and token is valid;  Time to render form for user to enter new password. NOTE: form must incorporate the id and token along abilty to enter new password field");
           } catch(e) {       // Token is Not Valid
             var errmsg = 'Token  passed to the /resetpassword route is Invalid';
             dpbutil.logerror(filename, errmsg)
             res.status(400).send({errmsg});
           }
           return;
       } else {               // User Not found
           dpbtutil.loginfo(filename, `Did Not Find User id:${req.params.id}` )
           res.status(404).send("Did Not Find User");
       }
    }).catch((e) => {
       console.log("ERROR: " + e)
    });
});  // end of app.get


// Desc: This route gets called when user submits new password via the password
// form. The form will submit password along with the id and token fields as hidden
// fields on the form.
// Input: user id, one time token, and user password passed in with form submission.
// Steps: 1) validate id, 2) decode and validate token 3) hash the new password
// 4) save password to database and respond to user with new token and success message.
app.post('/resetpassword', function (req, res) {
  var body = _.pick(req.body, ['id', 'token', 'password']);

  console.log("Body: " + JSON.stringify(body,null,2));

  // Check if ID is valid
  if (!ObjectID.isValid(body.id)) {
    console.log("Id paramter invalid");
    res.status(400).send({errmsg: "Invalid ID " });
    return;
  }

  console.log("ID VALID")  ;

  // Fetch user by id and verify if token is valid
   User.findOne({_id: body.id}).then((user)=> {
      if (user) {              // Found User
          // construct secret pasword from user password and createAt date/time (in ticks)
          var dateTicks = dpbutil.convertDateToTicks(user.createdAt);
          var resetPwSecret = user.password + dateTicks;

          // Check if token is valid
          try {               // Token is valid
            console.log("TOKEN: " + body.token);
            decoded = jwt.verify(body.token, resetPwSecret);
          } catch(e) {       // Token is Not Valid
            var errmsg = 'Token  passed to the /resetpassword route is Invalid';
            dpbutil.logerror(filename, errmsg)
            res.status(400).send({errmsg});
            return;
          }
          // Hash new password and save into the database
          user.password = body.password;
          user.save().then(() => {   // Before save, encrypt password then saves user obj with encyrypted password
            return user.generateAuthToken(); // generate token, save to tokens array,and return promise that saves object, return token
          }).then((token) => {
            res.header('x-auth', token).send(user);  // set header x-auth property and return user object
          }).catch((e) => {
            var errorType = dpbutil.getErrorType(e)
            var errmsg = "";
            switch(errorType) {
             case 'UncaughtException':
                errmsg = `UncaughtException during registration process for email ${user.email} `;
                dpbutil.logerror(filename, e)
                res.status(400).send(e);
                break;
             default:
                res.status(400).send(e);
                return;
            }
          })
          return;
      } else {               // User Not found
          dpbtutil.loginfo(filename, `Did Not Find User id:${body.id}` )
          res.status(404).send("Did Not Find User");
      }
   }).catch((e) => {
      console.log("ERROR: " + e)
   });
});  // end of Post/resetpassword

// Server port configuration
app.listen(port, () => {
  console.log(`Express Started on port ${port}`);
});

// module.exports = {app};
