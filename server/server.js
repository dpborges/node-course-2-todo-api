var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
// process.env.PORT is for Heroku. If not set, default to 3000
const port = process.env.PORT || 3000;

// Configure middleware
app.use(bodyParser.json());

// Route  to create a todo item
app.post('/todos', (req, res) => {
  // Create a todo
  var todo = new Todo({
    text: req.body.text
  });
  // Save todo object
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Route find todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
      res.send({todos});
    }, (e) => {       /* In the error handler, send back a status of 400 and the error */
      res.status(400).send(e);
  }); /* end then */
}); /* end app.get */

// Sample HTTP todo query request by ID. The :id is send as a param in the request
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  Todo.findById(id).then((todo) => {
    if (todo) {
      res.send({todo});
    } else {
      res.status(404).send();
    }
  }).catch((e) => {
    res.status(404).send();
  });
});

// Sample HTTP user query request by ID. The :id is send as a param in the request
app.get('/users/:id', (req, res) => {
    var id = req.params.id;
    console.log(`this is the id sent on request ${id}`);
    if (!ObjectID.isValid(id)) {
      return console.log(res.status(404));
    }
    console.log('ID WAS VALID');

    User.findById(id).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
});

// Route to check user email and password
app.post('/users', (req, res) => {
  // pick off email and password from request
  var body = _.pick(req.body, ['email', 'password']);
  // create new user object
  var user = new User(body);

  //save user in database, then generateAuthToken, then send token back in response header
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    /* for some reason the promise passed me a token wiht the entire user schema object,
    instead of the just passing the token, hence had to extract token here from user
    object here before passing it to header.  */
    token = token.tokens[0].token;

    res.header('x-auth', token).send(user);  /* x-auth indicates custom header */
    console.log(`Sent Response`);
  }).catch((e) => {
    console.log(`I'm now in catch block`);
    res.status(400).send(e);
  });
});

// Server port configuration
app.listen(port, () => {
  console.log(`Express Started on port ${port}`);
});

module.exports = {app};
