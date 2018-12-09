/**
 * Main application routes
 */
'use strict';

const mainController = require('./app/controllers/main.controller');

/**
 * Use express to make the api routing
 * @param {object} app - An express application
 */
module.exports = (app) => {
  //Handle CORS & Cross Domain Origin
  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  //Main route 
  app.get('/', mainController.mainProcess);

  // All other routes should redirect to views with error format
  app.get('/*', function(req, res) {
      res.status(404).json({err: "NOT FOUND", msg: "Sorry there is no such url !"});
    });
};