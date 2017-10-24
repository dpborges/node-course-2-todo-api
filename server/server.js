var express = require('express');
var bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();

// Configure middleware
app.use(bodyParser.json());

// Define routes below

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
    return console.log(res.status(404));
  }
  console.log('ID WAS VALID');

  Todo.findById(id).then((todo) => {
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
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
  })
});

// Server port configuration
app.listen(3000, () => {
  console.log('Express Started on port 3000');
});

module.exports = {app};
