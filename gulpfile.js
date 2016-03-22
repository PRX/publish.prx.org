'use strict';

const gulp   = require('gulp');
const jade   = require('gulp-jade');
const seq    = require('gulp-sequence');
const shell  = require('gulp-shell');
const dotenv = require('dotenv');
const fs     = require('fs');
const KarmaServer  = require('karma').Server

// Public tasks (serial)
gulp.task('git:hooks:pre-commit', seq('jspm:unbundle'));
gulp.task('postinstall',          seq('jspm:install', 'typings:install', 'git:hooks:install'));
gulp.task('start',                seq('build:dev', 'env:watch', 'server:dev'));

gulp.task('test', function (done) {
  new KarmaServer({
    configFile: __dirname + '/config/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('tdd', function (done) {
  new KarmaServer({
    configFile: __dirname + '/config/karma.conf.js'
  }, done).start();
});

// Build tasks (parallel)
gulp.task('build:dev', ['env:write', 'jade:index:dev', 'jspm:bundle:dev']);

// Server tasks
gulp.task('server:dev', shell.task(['lite-server --config=config/dev.bs.config.json']));

// JSPM bundle tasks
gulp.task('jspm:bundle:dev', shell.task('jspm bundle src/main - [src/app/**/*] ./.dev/vendor.js --inject'));
gulp.task('jspm:install',    shell.task('jspm install'));
gulp.task('jspm:unbundle',   shell.task('jspm unbundle'));

// Compile tasks
gulp.task('jade:index:dev', () => {
  return gulp
    .src('./src/index.jade')
    .pipe(jade({ locals: { dist: false } }))
    .pipe(gulp.dest('./src/'));
});

// Utility tasks
const loc = ['#!/bin/sh', 'PATH="/usr/local/bin:$PATH"', 'npm run git:hooks:pre-commit'];
gulp.task('git:hooks:install', shell.task([
  `printf '${loc.join('\n')}' > ./.git/hooks/pre-commit`,
  'chmod +x ./.git/hooks/pre-commit'
]));
gulp.task('typings:install', shell.task('typings install'));

// write constants for Env to src file
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
gulp.task('env:write', function(cb) {
  var defaults = parseDotFile('env-defaults', true);
  var overrides = parseDotFile('.env', false);
  var s = '// GENERATED FILE, DO NOT EDIT OR CHECK IN\n';
  s += 'export class Env {\n';
  for (var k in defaults) {
    s += '  public static '+k+' = '+encodeDotValue(overrides[k]||defaults[k]) + ';\n';
  }
  s += '}\n';
  fs.writeFile('src/util/env.ts', s, cb);
});
gulp.task('env:watch', function() {
  gulp.watch(['env-defaults', '.env'], ['env:write']);
});
