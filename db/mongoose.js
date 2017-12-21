var mongoose = require('mongoose');
// tell mongoose which Promise library we want to use.
mongoose.Promise = global.Promise;
/*
mongoose is going to be waiting for that connection before it
ever actually tries to make the query.
*/
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
  mongoose
};
