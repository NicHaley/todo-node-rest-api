'use strict';
module.exports = function(app) {
  var apis = require('../controllers/apiController');

  app.route('/')
    .get(apis.get_spotify)
};