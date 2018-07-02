const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todosArray, populateTodos, users, populateUsers} = require('./seed/seed');


// Run some code before running each test case (otherwise know as calls  to "it")
beforeEach(populateUsers);
beforeEach(populateTodos);

// Create describe block so you can glance test output on the terminal
describe('POST / todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    // Make request via supertest
    request(app)    /* pass the app you want to make request on */
      .post('/todos') /* pass url path */
      .send({text}) /* pass in object which gets converted to json by supertest*/
                    /* Note, This is using ES6 syntax instead of {text: text} */
      .expect(200)  /* expecting  status to be 200 */
      .expect((res) => {
          expect(res.body.text).toBe(text); /* expect response to have text proprty equal to text defined above */
       })
      .end((err, res) => {   /* pass a callback function to the .end function */
       if (err) {
        return done(err);  /* return and exit here if error exists */
       }
       // Confirm that todo created does exist by using mongoose find
       Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) =>  done(e));  /* catches any  errors from callback function */
      }); /* end .end */
    }); /* end it */

  //  Test case to check that todo document is not created if we send bad data */
  it('should not create new todo with invalid data', (done) => {
    request(app)    /* pass the app you want to make request on */
      .post('/todos') /* pass url path for POST */
      .send({})     /* pass in object which gets converted to json by supertest*/
      .expect(400)  /* expecting  status to be 200 */
      .end((err, res) => {   /* pass a callback function to the .end function */
        if (err) {
          return done(err);   /* return and exit here if error exists */
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));  /* catches any  errors from callback function */
      }); /* end .end */
  });  /* end it */
}); /* end describe */

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
          .get('/todos')
          .expect(200)
          .expect( (res) => {
            expect(res.body.todos.length).toBe(2)
          })
          .end(done);
    });
});

// Test case for querying by ID.
// Note IDs are generated while creating static array at beginning
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
          .get(`/todos/${todosArray[0]._id.toHexString()}`)
          .expect(200)
          .expect( (res) => {
            expect(res.body.todo.text).toBe(todosArray[0].text)
          })
          .end(done);
    });

    // Test case for querying by non existent ID.
    it('should return 404 if non-existant id', (done) => {
        var hexID = new ObjectID().toHexString();

        request(app)
          .get(`/todos/${hexID}`)
          .expect(404)
          .end(done);
    });

    // Test case for querying invalid ObjectID.
    it('should return 404 if non-existant id', (done) => {
        request(app)
          .get('/todos/1234')
          .expect(404)
          .end(done);
    });
}); /* end describe GET /todos/:id */

// Test cases for the sign up route
describe('POST /users', () => {
    /* creates user if request has valid email and password */
    it('should create a user', (done) => {
      var email = 'example@example.com';
      var password = '123mnb!';

      request(app)
        .post('/users')
        .send(email, password) /* sets header name and header value */
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
        .end(done); /* wraps up the test case */
    });
    /*return validation errors if request is invalid.  */
    // it('should return validation errors if request is invalid', (done) => {
    //   request(app)
    //     .get('/users/me')
    //     .expect(401)
    //     .expect((res) => {
    //       expect(res.body).toEqual({}); /* use toEqual instead of toBe when comparing objects*/
    //     })
    //     .end(done); /* wrap up test case*/
    // });
    // /*do not crate test case if email in use.  */
    // it('should not create test case if email in use', (done) => {
    //   request(app)
    //     .get('/users/me')
    //     .expect(401)
    //     .expect((res) => {
    //       expect(res.body).toEqual({}); /* use toEqual instead of toBe when comparing objects*/
    //     })
    //     .end(done); /* wrap up test case*/
    // });
}); /* end describe POST /users */
