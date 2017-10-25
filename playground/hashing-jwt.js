const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

// This file is using JWT which makes generating and verifyin a hash simpler

var data = {
  id: 10
};

// "jwt.sign" takes the data and it signs it (creates hash and returns token value)
// jwt takes 2 arguments. Data object and the secret.
// The token is the value we send back to the user.
var token = jwt.sign(data, 'secret');
console.log(token); /* you can go to jwt.io to verify components of token by
                    cutting and pasting it in the front end. */

// "jwt.verify" does opposite. Takes that token and the secret and makes sure data
// was not manipulated. The value of decoded is an object with the original data
//  and the instance timestamp taken at the time the data was signed.
var decoded = jwt.verify(token, 'secret');
console.log('decoded', decoded);
