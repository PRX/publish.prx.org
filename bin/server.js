'use strict';
const express  = require('express');
const morgan   = require('morgan');
const gzip     = require('connect-gzip-static');
const fs       = require('fs');
const dotenv   = require('dotenv');
const newrelic = require('newrelic');

// warn if not built
try {
  fs.statSync(`${__dirname}/../dist/index.html`);
} catch (err) {
  console.error('ERROR: empty dist directory - did you forget to build first?');
  process.exit(1);
}

// pull env key names from env-example
let exampleText = fs.readFileSync(`${__dirname}/../env-example`);
let keys = Object.keys(dotenv.parse(exampleText));

// safe parse .env
let env = {};
try {
  let dottext = fs.readFileSync(`${__dirname}/../.env`);
  env = dotenv.parse(dottext);
} catch (err) {}

// pull overrides out of process.env and .env
let jsscript = '<script type="text/javascript">window.ENV={';
for (let key of keys) {
  if (process.env[key] !== undefined || (env[key] && env[key] !== '')) {
    let val = process.env[key] || env[key];
    if (['true', 'false', 'null', 'undefined'].indexOf(val) > -1) {
      val = val;
    } else if (isNaN(val) || val == '') {
      val = `'${val}'`;
    } else {
      val = val;
    }
    jsscript += `${key}:${val},`;
  }
}
jsscript = jsscript.slice(0, -1); // trailing comma
jsscript += '};</script>';

// inject into index.html
let indexHtml = fs.readFileSync(`${__dirname}/../dist/index.html`).toString();
let indexStart = indexHtml.split('<head>')[0] + '<head>';
let indexEnd = indexHtml.split('<head>')[1].replace(/<script.+[dotenv\.js].+$/m, jsscript);

// serve it!
let app = express();
let lastToken = path => path.substr(path.lastIndexOf('/') + 1).split(/\?|;/)[0];
let isFile = path => lastToken(path).indexOf('.') > -1;
app.use(morgan('combined', { skip: req => isFile(req.path) }));

// serve static assets and show 404s, but ignore index.html
let serveStatic = gzip('dist');
app.use(function(req, res, next) {
  if (req.path === '/' || req.path === '/index.html') {
    next();
  } else {
    serveStatic(req, res, next);
  }
});
app.use(function fileNotFound(req, res, next) {
  if (isFile(req.path)) {
    res.status(404).send('Not found');
  } else {
    next();
  }
});

// plain routes get the index
app.get('*', function sendIndex(req, res) {
  if (req.headers['x-forwarded-proto'] === 'http') {
    res.redirect(`https://${req.headers['host']}${req.url}`);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.send(indexStart + newrelic.getBrowserTimingHeader() + indexEnd);
  }
});
app.listen(process.env.PORT || 4200);
