let express = require('express');
let app = express();
let db = require('./db');
let UserController = require('./user/UserController');
let AuthController = require('./auth/AuthController');

app.use('/users', UserController);
app.use('/api/auth', AuthController);

module.exports = app;