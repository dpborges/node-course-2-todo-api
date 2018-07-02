var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {

  // Set config variable to json object that is in config.json
  var config = require('./config.json');
  

  // Assign the development or test object in config.json based on what was set for env variable
  var envConfig = config[env];

  // For each property (aka key) in envConfig, assign value to the process environement variable.
  // For example:  process.env.PORT will be set to 3000
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  })
}
