const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


// ****************************************************************************
// Seed todos
// ****************************************************************************
// Create an array of todo objects to use for testing
const todosArray = [
  { _id: new ObjectID(), text: '1st test todo' },
  { _id: new ObjectID(), text: '2nd test todo' }
];

const populateTodos = (done) => {
  Todo.remove({}).then( () => {
    return Todo.insertMany(todosArray);   /* return allows us to chain callbacks and add antoher done */
  }).then( () => done());// {
            // Todo.find({}).then((todoDocs) => {
            //     console.log('This is num todo docs ' + TodoDocs.length);
            //   }, (e) => done());
            // done();
        //  });
};

// ****************************************************************************
// Seed users collection; seed one user with hashed value and one without
// ****************************************************************************
const userOneId = new ObjectID;
const userTwoId = new ObjectID;
const users = [
  { _id: userOneId,
    email: 'danb@gmail.com',
    password: 'userOnePass',
    tokens: [
      { access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'secretval').toString()
      }
    ]
  }, /* end user one object definition */

  { _id: userTwoId,
    email: 'jen@gmail.com',
    password: 'userTwoPass'
  } /* end user two object definition */
]; /* end of tokens array*/

const populateUsers = (done) => {
  User.remove({}).then( () => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {todosArray, populateTodos, users, populateUsers};
