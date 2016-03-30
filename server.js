'use strict';
var express = require('express');
var emitter = require('chokidar-socket-emitter');
var dotenv  = require('dotenv');
var fs      = require('fs');
var jade    = require('jade');
var open    = require('open');

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

  // Just-in-time compile env files
  app.get('/util/env.ts', function(req, res) {
    function parseDotFile(path, mustExist) {
      try { return dotenv.parse(fs.readFileSync(path, {encoding: 'utf8'})); }
      catch (e) { if (e.code != 'ENOENT' || mustExist) throw e; }
      return {};
    }
    function encodeDotValue(val) {
      if (['true', 'false', 'null', 'undefined'].indexOf(val) > -1) return val;
      if (isNaN(val) || val == '') return "'" + val + "'";
      return val;
    }
    var defaults = parseDotFile('config/env-defaults', true);
    var overrides = parseDotFile('config/env', false);
    var s = '// GENERATED FILE, DO NOT EDIT OR CHECK IN\n';
    s += 'export class Env {\n';
    for (var k in defaults) {
      s += '  public static '+k+' = '+encodeDotValue(overrides[k]||defaults[k]) + ';\n';
    }
    s += '}\n';
    res.send(s);
  });

  // Route remaining requests to index
  app.get('*', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(jade.renderFile('index.jade', {dist: false}));
  });

  return app.listen(port);
}
