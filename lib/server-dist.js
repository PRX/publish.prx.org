'use strict';
var express = require('express');
var pug     = require('pug');
var config  = require('./config');

// pre-render
var index = pug.renderFile('index.pug', {
  dist: true,
  config: config.windowEnv()
});

/**
 * Serve up some publish.prx.org
 */
var server = listen(3000);

// Setup routes
function listen(port) {
  var app = express();

  // Static files
  app.use('/',       express.static('.dist'));
  app.use('/app',    express.static('app'));
  app.use('/assets', express.static('assets'));

  // Return 404 for anything with a file extension
  app.use(function fileNotFound(req, res, next) {
    if (req.path.indexOf('.') > -1) {
      res.status(404).send('Not found');
    } else {
      next();
    }
  });

  // Route remaining requests to index
  app.get('*', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(index);
  });

  return app.listen(port);
}
