var env = process.env.NODE_ENV || 'development';

// in Heroku, process.env.NODE_ENV will be 'production'
if (env === 'development' || env === 'test') {
  /*
  When we require JSON it actually automatically parses it
  into a javascript object.
  */
  var config = require('./config.json');
  var envConfig = config[env];

  // Object.keys returns an array of all of the keys
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}


// if (env === 'development') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if (env === 'test') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }
