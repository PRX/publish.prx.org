'use strict';
var dotenv  = require('dotenv');
var fs      = require('fs');

/**
 * Compute the runtime window.ENV values
 */
exports.windowEnv = function config() {
  dotenv.config({silent: true});

  // get names from env.ts
  var envTs = fs.readFileSync(__dirname + '/../config/env.ts', {encoding: 'utf8'});

  // read overrides from ENV
  var overrides = [];
  envTs.replace(/public\s+static\sget\s+(\w+).+/g, function(match, name) {
    if (process.env[name] !== undefined) {
      overrides.push(name + ':' + encodeValue(process.env[name]));
    }
  });

  // assign to window.ENV
  return 'window.ENV={' + overrides.join(',') + '};';
}

// helper to literalize non-string values
function encodeValue(val) {
  if (['true', 'false', 'null', 'undefined'].indexOf(val) > -1) {
    return val;
  } else if (isNaN(val) || val == '') {
    return "'" + val + "'";
  } else {
    return val
  }
}
