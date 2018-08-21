/**
 * Created by Jaydeep on 6/21/2018.
 */
const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
//const passport = require('passport');

//router.post('/login', function (req, res, next) {
//  passport.authenticate('local', {session: false}, (err, user, info) => {
//    if (err || !user) {
//      return res.status(400).json({
//        message: 'Something is not right',
//        user   : user
//      });
//    }
//    req.login(user, {session: false}, (err) => {
//      if (err) {
//        return res.status(400).json({
//          err   : err
//        });
//      }
//      // generate a signed son web token with the contents of user object and return it in the response
//      const token = jwt.sign(user, 'rst_jwt_secret');
//      return res.json({user, token});
//    });
//  })(req, res);
//});