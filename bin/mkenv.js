'use strict';
const fs = require('fs');
const dotenv = require('dotenv');

// generate a javascript window.ENV file from the .env
let env;
try {
  let text = fs.readFileSync(`${__dirname}/../.env`);
  env = dotenv.parse(text);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('\n.env file not found! Please run "cp env-example .env"\n');
    process.exit(1);
  } else {
    throw err;
  }
}

// stringify to javascript environment
let jsfile = 'window.ENV = {};';
for (let key of Object.keys(env)) {
  let val = env[key];
  if (['true', 'false', 'null', 'undefined'].indexOf(val) > -1) {
    val = val;
  } else if (isNaN(val) || val == '') {
    val = `'${val}'`;
  } else {
    val = val;
  }
  jsfile += `\nwindow.ENV.${key} = ${val};`;
}
fs.writeFileSync(`${__dirname}/../src/assets/dotenv.js`, jsfile);
