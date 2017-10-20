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

  // Find returns a cursor, which in turn loops thru to return an array of documents.
  // Note that find works likea where clause, and can be used for filtering
  // db.collection supports promises, hence the chained "then" method.
  // Find below, queries by completed status.
  // code=> db.collection('Todos').find({completed: true}).toArray().then((docs) => {
  // This find queries by _id
  // db.collection('Todos').find({
  //   _id: new ObjectID('59e91bd14cadbfcae325dd19')}).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // this sample uses count instead of toArray
  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count: ${count} `);
  //   }, (err) => {
  //   console.log('Unable to fetch count', err);
  // });

  // this sample is using find to search or a particular property value in Users collection
  db.collection('Users').find({name: 'David'}).toArray().then((docs) => {
     console.log('Users');
     console.log(JSON.stringify(docs, undefined, 2));
   }, (err) => {
     console.log('Unable to fetch Users', err);
 });


  // db.close();
});
