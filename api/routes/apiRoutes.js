'use strict';
module.exports = function(app) {
  var apis = require('../controllers/apiController');

  // todoList Routes
  app.route('/tasks')
    .get(apis.get_spotify)
};