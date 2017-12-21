const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: { // token type
      type: String,
      required: true
    },
    token: { // token value
      type: String,
      required: true
    }
  }]
});

// instance methods has access to the individual document
UserSchema.methods.toJSON = function () {
  // override the toJSON method (when mongoose model is converted into a JSON value)
  var user = this;
  // taking mongoose variable (user) and converting it into a regular object
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'account']);
};

UserSchema.methods.generateAuthToken = function() {
  /*
  Arrow functions don't bind a 'this' keyword. We need 'this' for our methods
  because 'this' stores the individual document.
  */
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  user.tokens.push({access, token});

  // save the data to database and return the token
  return user.save().then(() => {
    return token;
    /*
    this token will get passed as the success argument for the next then call.
    In the server file we can grab the token by tacking on a then callback
    getting access to the token and then responding inside of the callback function.
    */
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  // $pull removes items from an array that match a specified condition.
  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

/*
model method (we don't need an instance to use model method).
model methods get called with the model as the 'this' binding.
*/
UserSchema.statics.findByToken = function (token) {
  var User = this; // this binds the model
  var decoded;

  // jwt.verify() will throw an error if anything goes wrong (try & catch)
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    /*
    This Promise will get returned from findByToken.
    So the then success case in server.js will never fire.
    The catch callback will though.
    */
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject(); // same as above code
  }

  // return a Promise in order to add some chaining
  return User.findOne({
    '_id': decoded._id,  // same as _id: decoded._id (quotes are not necessary)
    'tokens.token': token, // query a nested document
    'tokens.access': 'auth' // quotes are required when we have a dot in the value
  });
};

UserSchema.statics.findByCredentials = function (account, password) {
  var User = this;

  return User.findOne({account}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });

  });
};

/*
This (pre) is going to run some code before a given event
the event we want to run code before is the 'save' event
*/
UserSchema.pre('save', function (next) {
  var user = this;

  // avoid hashing password multiple times
  // isModified takes an individual property
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next(); // complete the middleware
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
