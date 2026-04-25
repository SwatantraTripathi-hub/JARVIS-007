const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');
require('dotenv').config();
// ...existing code...

router.post('/register',authController.register);
router.post('/login',authController.login);

module.exports = router;