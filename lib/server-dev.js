'use strict';
var express = require('express');
var emitter = require('chokidar-socket-emitter');
var jade    = require('jade');
var open    = require('open');
var config  = require('./config');

/**
 * Serve up some publish.prx.org
 */
var server = listen(3000);
emitter({app: server});
open('http://publish.prx.dev');

// Setup routes
function listen(port) {
  var app = express();

  // CORS headers for reloader
  app.use(function allowCORS(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://publish.prx.dev');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Static files
  app.use('/.dev',          express.static('.dev'));
  app.use('/app',           express.static('app'));
  app.use('/assets',        express.static('assets'));
  app.use('/config',        express.static('config'));
  app.use('/jspm_packages', express.static('jspm_packages'));
  app.use('/node_modules',  express.static('node_modules'));
  app.use('/tsconfig.json', express.static('tsconfig.json'));
  app.use('/util',          express.static('util'));

  // Route remaining requests to index
  app.get('*', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(jade.renderFile('index.jade', {
      dist: false,
      config: config.windowEnv()
    }));
  });

  return app.listen(port);
}
