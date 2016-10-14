'use strict';
const express  = require('express');
const morgan   = require('morgan');
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
app.use('/', express.static('dist', {index: false}));
app.use(morgan('combined', { skip: req => req.path.indexOf('.') > -1 }));
app.use(function fileNotFound(req, res, next) {
  if (req.path.indexOf('.') > -1) {
    res.status(404).send('Not found');
  } else {
    next();
  }
});
app.get('*', function sendIndex(req, res) {
  if (req.headers['x-forwarded-proto'] === 'http') {
    res.redirect(`https://${req.headers['host']}${req.url}`);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.send(indexStart + newrelic.getBrowserTimingHeader() + indexEnd);
  }
});
app.listen(process.env.PORT || 4200);
