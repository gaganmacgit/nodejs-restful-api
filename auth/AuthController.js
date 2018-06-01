let express = require('express');
let router = express.Router();

let bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

let User = require('../user/User');

let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('../config');

let verifyToken = require('../auth/VerifyToken')

router.post('/register', function (request, response) {
  let hashedPassword = bcrypt.hashSync(request.body.password, 8);
  //console.log(' hashed password is ', hashedPassword);
  User.create({
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword
  }).then((user) => {
    //console.log(' Inside then block , response is ', user);
    let token = jwt.sign({
      id: user._id
    }, config.secret, {
      expiresIn: 86400
    });
    //console.log('token generated is ', token);
    return response.status(200).send({
      auth: true,
      token
    });
  }).catch(error => {
    if (error) return response.status(500).send('Error occured while registering the user !!', error);
  })
});

router.get('/me', verifyToken, (request, response, next) => {

  let userId = request.userId;
  User.findById({
    _id: userId
  }).select('-password -__v').then((user) => {
    response.status(200).send(user);
  }).catch((error) => {
    response.status(500).send('Exception occured finding user by id ', error);
  })
});


router.post('/login', (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;
  console.log('Received ', userEmail, userPassword);
  //get the user from DB based on the above information
  User.find({
    email: userEmail
  }).then(dbUser => {

    // console.log(' inside old code '+ dbUser)
    if (bcrypt.compareSync(userPassword, dbUser[0].password)) {
      //password matches, so generate the JWT token
      let token = jwt.sign({
        id: dbUser._id
      }, config.secret, {
        expiresIn: 86400
      });
      response.status(200).send({
        auth: true,
        token
      })

    } else {
      response.status(401).send({
        auth: false,
        token: null
      })
    }

  }).catch(error => {
    return response.status(404).send('No user found.', error);
  })
});
module.exports = router