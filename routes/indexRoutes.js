/**
 * Created by Jaydeep on 3/10/2018.
 */
var express = require('express');
const routes = express.Router();
routes.get('/', function (req, res) {
  try {
    res.sendFile('../public/index.html', {root: __dirname});
  }
  catch (err) {
    res.json("not ok");
  }
});

routes.post('/', function (req, res) {
  try {
    res.sendFile('../public/index.html', {root: __dirname});
  }
  catch (err) {
    res.json("not ok");
  }
});

module.exports = routes;