'use strict';
var dotenv  = require('dotenv');
var fs      = require('fs');

/**
 * Compute the runtime env.ts
 *
 * TODO: caching
 */
module.exports = function config(req, res) {
  dotenv.config({silent: true});

  // replace variables in env.ts
  var str = fs.readFileSync(__dirname + '/../config/env.ts', {encoding: 'utf8'});
  str = str.replace(/public\s+static\s+(\w+).+/g, function(match, name) {
    if (process.env[name] !== undefined) {
      return 'public static ' + name + ' = ' + encodeValue(process.env[name]) + ';';
    } else {
      return match; // use default
    }
  });

  res.send(str);
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
