var {User} = require('./../../models/user');
/*
The actual route is not going to run until next gets called inside
of the middleware.
*/
// middleware
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  // model method
  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(); // it will go to 'catch' down below
    }

    // res.send(user);
    req.user = user; // Make changes to the request object, so we can use it later
    req.token = token;
    next(); // or 'res.send(req.user)' in app.get('/users/me') will never actilly execute
  }).catch((e) => {
    // catch the reject()
    res.status(401).send();
  });
};

module.exports = {authenticate};
