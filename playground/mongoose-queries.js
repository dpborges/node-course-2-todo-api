const {ObjectID}  = require('mongodb'); /* allows you to use ObjectID methods*/

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '59ee205a00737e6d1479b19f';

// Sample code using ObjectID to check if ID is valid
if (!ObjectID.isValid(id)) {
  console.log('Id is not valid');
}

// Sample query by id
Todo.find({ _id: id})
     .then( (todos) => {  /* find returns an array */
      console.log('Todos ', todos);
    });

// Sample query to findOne. If findOne was empty {}, it will return 1st one.
Todo.findOne({ _id: id })
      .then( (todo) => {  /* returns an object */
      console.log('Todo ', todo);
    });

// Sample to find by ID, with catch to catch invalid ids */
Todo.findById(id).then( (todo) => {  /* returns an object */
      if (!todo) {
        return console.log('ID not found');
      }
      console.log('Todo ', todo);
}).catch((e) => console.log(e));  /*catch catches invalid ids */

// *******************************************************
//  Query users
// *******************************************************
id = '59ee2fe86d616c1f80681263';

// Sample to find by ID, with catch to catch invalid ids */
User.findById(id).then( (user) => {  /* returns an object */
      if (!user) {
        return console.log('ID for User not found');
      }
      console.log('User ', user);
}).catch((e) => console.log(e));  /*catch catches invalid ids */
