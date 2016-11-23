'use strict';
const dotenv   = require('dotenv');
const fs       = require('fs');
const pug      = require('pug');
const newrelic = require('newrelic');
const spawn    = require('child_process').spawn

/**
 * Read dotenv (.env + ENV)
 */
exports.readEnv = () => {
  let exampleText = fs.readFileSync(`${__dirname}/../env-example`);
  let exampleKeys = Object.keys(dotenv.parse(exampleText));

  let dots = {};
  try {
    let dottext = fs.readFileSync(`${__dirname}/../.env`);
    dots = dotenv.parse(dottext);
  } catch (err) {}

  let env = {};
  for (let key of exampleKeys) {
    if (process.env[key] !== undefined || (dots[key] && dots[key] !== '')) {
      let val = process.env[key] || dots[key];
      if (val === 'true') {
        env[key] = true;
      } else if (val === 'false') {
        env[key] = false;
      } else if (isNaN(val) || val == '') {
        env[key] = val;
      } else {
        env[key] = parseInt(val);
      }
    } else {
      env[key] = undefined;
    }
  }
  return env;
};

/**
 * Find the script tags to include
 */
exports.findScripts = (isDist) => {
  let scripts = ['inline.js'];
  if (isDist) {
    let files = [];
    try { files = fs.readdirSync(`${__dirname}/../dist`); } catch (e) {}
    scripts.push(files.find(f => f.match(/^styles\..+\.bundle\.js$/)));
    scripts.push(files.find(f => f.match(/^scripts\..+\.bundle\.js$/)));
    scripts.push(files.find(f => f.match(/^main\..+\.bundle\.js$/)));
    scripts = scripts.filter(f => f ? true : false);
    if (scripts.length !== 4) {
      console.error('ERROR: could not find built scripts in ./dist/');
      console.error('       did you forget to run npm build?');
      process.exit(1);
    }
  } else {
    scripts.push('styles.bundle.js', 'scripts.bundle.js', 'main.bundle.js');
  }
  return scripts;
};

/**
 * Compile the index
 */
let cachedEnv = null, cachedScripts = null, cachedFn = null;
exports.buildIndex = (isDist) => {
  cachedEnv = (isDist && cachedEnv) ? cachedEnv : exports.readEnv();
  cachedScripts = (isDist && cachedScripts) ? cachedScripts : exports.findScripts(isDist);
  cachedFn = (isDist && cachedFn) ? cachedFn : pug.compileFile(`${__dirname}/../src/index.pug`);

  // DON'T cache newrelic header
  if (isDist) {
    let nr = newrelic.getBrowserTimingHeader();
    return cachedFn({env: cachedEnv, scripts: cachedScripts, newRelicHeader: nr});
  } else {
    return cachedFn({env: cachedEnv, scripts: cachedScripts});
  }
};

/**
 * Determine if a request looks like a path (vs a file)
 */
exports.isIndex = (path) => {
  if (path === '/' || path === '/index.html') {
    return true;
  } else {
    let lastToken = path.substr(path.lastIndexOf('/') + 1).split(/\?|;/)[0];
    return lastToken.indexOf('.') === -1;
  }
};

/**
 * Spawn a process to run ng serve
 */
exports.ngServe = (port) => {
  let ng = `${__dirname}/../node_modules/.bin/ng`;
  return spawn(ng, ['serve', '--port', port], {stdio: 'inherit'});
};
