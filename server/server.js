var express = require('express');
var bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
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


app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
      res.send({todos});
    }, (e) => {       /* In the error handler, send back a status of 400 and the error */
      res.status(400).send(e);
  }); /* end then */
}); /* end app.get */

app.listen(3000, () => {
  console.log('Express Started on port 3000');
});

module.exports = {app};
