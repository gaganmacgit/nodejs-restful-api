let jwt = require('jsonwebtoken');
let config = require('../config');

function verifyToken(request, response, next) {

  let token = request.body.token || request.params.token || request.headers['x-access-token']
  if (!token) {
    return response.status(401).send({
      auth: false,
      message: 'Failed to authenticate token'
    });
  }
  jwt.verify(token, config.secret, (error, decodedToken) => {
    if (error) return response.status(500).send({
      auth: false,
      message: 'Failed to authenticate token.'
    });
    request.userId = decodedToken.id;
    next();
  });
}
module.exports = verifyToken;