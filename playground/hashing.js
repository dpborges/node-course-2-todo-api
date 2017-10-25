const {SHA256} = require('crypto-js');

// PREAMBLE
// Hashing is a one way algorithm. It produces the same hash value
// for the given string everytime. You cannot convert hash value
// to string. This technique is used to save passwords in a database.
// When user passes password, we generate hash and compare to hash
// in the database. If does not match the hash in database,
// password is rejected.

var message = 'I am user number 3';

// hash the text in the message variable. Convert object to string
var hash = SHA256(message).toString();

// print message and hash to the console
console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);


// The following simulates the JWT (Jason Web Token)standard
// If we allow user to access id below they can change user id
// to something other than theirs. This would be a major security
// breach. This is why we use tokens
var data = {
  id: 4
};

// Using technique below, we hash the user id above so user cannot
// change it. But what happens if user installs crypto-js and hashes the id's?
// This would be a problem.
// To prevent user from doing this, we "salt" the hash. In other
// words add something to change the value. That salt value is appended
// to the hash string. The user can change value from 4 to 5,
// and generate hash, but it will not match the salted hash string we have
// on the server side. Here is hash string that has been salted
var token = {
  data,
  hash: SHA256(JSON.stringify(data) + 'secret').toString()
};

// If man in the middle tries to assign Id 4 and creates a hash, we get "Data has changed"
// otherwise, you get "Data has not changed" on server side. That is because
// man in the middle does not have the scret salt. Comment out out
// next 2 lines and hash will match.
token.data.id = 4;
token.hash = SHA256(JSON.stringify(token.data)).toString();

// END of man in the middleware


// server side
var resultHash = SHA256(JSON.stringify(token.data) + 'secret').toString();

if (resultHash === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed');
}
