'use strict';

const gulp   = require('gulp');
const jade   = require('gulp-jade');
const nib    = require('nib');
const seq    = require('gulp-sequence');
const shell  = require('gulp-shell');
const stylus = require('gulp-stylus');

// Public tasks (serial)
gulp.task('git:hooks:pre-commit', seq('jspm:unbundle'));
gulp.task('postinstall',          seq('jspm:install', 'typings:install', 'git:hooks:install'));
gulp.task('start',                seq('build:dev', 'server:dev'));

// Build tasks (parallel)
gulp.task('build:dev', ['jade:index:dev', 'stylus:common:dev', 'jspm:bundle:dev']);

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
gulp.task('stylus:common:dev', () => {
  return gulp
    .src('./src/stylesheets/common.styl')
    .pipe(stylus({ use: [nib()], import: ['nib'] }))
    .pipe(gulp.dest('./src/stylesheets/'));
});

// Utility tasks
const loc = ['#!/bin/sh', 'PATH="/usr/local/bin:$PATH"', 'npm run git:hooks:pre-commit'];
gulp.task('git:hooks:install', shell.task([
  `printf '${loc.join('\n')}' > ./.git/hooks/pre-commit`,
  'chmod +x ./.git/hooks/pre-commit'
]));
gulp.task('typings:install', shell.task('typings install'));
