// Note: following line will be rewritten using destructuring.
// this one=>  const MongoClient = require('mongodb').MongoClient;
//  is now written like this.
const {MongoClient, ObjectID} = require('mongodb');

// see a simpler example  immedidately below

// Sample of an ES6 feature known as destructuring
// var user = {name: 'andrew', age: 25};
// var {name} = user;   /* pulls out the name from the user object */
// console.log(name);   /* prints andrew to screen */

// **************************************************************************
// Following code provides samples for find docs in the database
// **************************************************************************
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongodb server ');
  }
  console.log('Connected to MongoDB server');

  // Sample of findOneAndUpdate
  db.collection('Todos').findOneAndUpdate({
      _id: new ObjectID('59e950b64cadbfcae325ebd0')
  }, {
    $set: {
      completed: true
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

});
