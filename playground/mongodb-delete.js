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

  //  An example of "deleteMany"
  // db.collection('Todos').deleteMany({text: 'Eat Lunch'}).then((result) => {
  //   console.log(result);
  // });

  //  An example of "deleteOne"
  // db.collection('Todos').deleteOne({text: 'foo'}).then((result) => {
  //   console.log(result);
  // });

  //  An example of "findOneAndDelete", returns data back then deletes
  db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    console.log(result);
  });





});
