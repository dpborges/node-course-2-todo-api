const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Run some code before running each test case (calls to "it")
beforeEach((done) => {
  Todo.remove({}).then(() => done());  /* remove here is similary to mongodb native method*/
});

// Create describe block so you can glance test output on the terminal
describe('{POST / todos}', () => {
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
        Todo.find().then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));  /* catches any  errors from callback function */
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
          expect(todos.length).toBe(0);
          done();
        }).catch((e) => done(e));  /* catches any  errors from callback function */
      }); /* end .end */
  });  /* end it */
}); /* end describe */
