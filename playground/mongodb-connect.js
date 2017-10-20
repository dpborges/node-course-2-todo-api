// Note: following line will be rewritten using destructuring.
// this one=>  const MongoClient = require('mongodb').MongoClient;
//  is now written like this.
const {MongoClient} = require('mongodb');

// see a simpler example  immedidately below

// Sample of an ES6 feature known as destructuring
// var user = {name: 'andrew', age: 25};
// var {name} = user;   /* pulls out the name from the user object */
// console.log(name);   /* prints andrew to screen */

// **************************************************************************
// Following code provides samples for inserting into the database
// **************************************************************************
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongodb server ');
  }
  console.log('Connected to MongoDB server');

  // sample #1 - insert doc into 'Todos' collection
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert into todo', err);
  //   };
  //
  //   console.log(JSON.stringify(result.ops,undefined,2));
  // });

 // sample #2 insert doc into 'Users' collection
 // Note that insertOne takes two parms: a document and a call back function
  db.collection('Users').insertOne({
    name: 'Daniel Borges',
    age: 59,
    location: 'NC'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert into users', err);
    };

    console.log(JSON.stringify(result.ops, undefined, 2));
    console.log('Timestamp embedded in _id: ' + JSON.stringify(result.ops[0]._id.getTimestamp()));
  });

  db.close();
});
