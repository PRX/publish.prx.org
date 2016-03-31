'use strict';

const gulp   = require('gulp');
const clean  = require('gulp-clean');
const newer  = require('gulp-newer');
const seq    = require('gulp-sequence');
const shell  = require('gulp-shell');
const rename = require('gulp-rename');
const KarmaServer  = require('karma').Server

// Public tasks (serial)
gulp.task('git:hooks:pre-commit', seq('jspm:unbundle'));
gulp.task('postinstall',          seq('jspm:install', 'typings:install', 'git:hooks:install', 'copy:deps'));
gulp.task('start',                seq('build:dev', 'copy:deps', 'server:dev'));

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
gulp.task('build:dev', ['jspm:bundle:dev']);

// Server tasks
gulp.task('server:dev', shell.task(['node server.js']));

// JSPM bundle tasks
const nonbundle = ['- [app/**/*]', '- [util/**/*]'].join(' ');
gulp.task('jspm:bundle:dev', function() {
  return gulp.src('config/systemjs.config.js')
    .pipe(newer('.dev/vendor.js'))
    .pipe(shell([
      'echo "" > util/env.ts',
      'jspm bundle ./app/main '+nonbundle+' ./.dev/vendor.js --inject',
      'rm -f util/env.ts'
    ]));
});
gulp.task('jspm:install',    shell.task('jspm install'));
gulp.task('jspm:unbundle',   shell.task('jspm unbundle'));

// Utility tasks
const loc = ['#!/bin/sh', 'PATH="/usr/local/bin:$PATH"', 'npm run git:hooks:pre-commit'];
gulp.task('git:hooks:install', shell.task([
  `printf '${loc.join('\n')}' > ./.git/hooks/pre-commit`,
  'chmod +x ./.git/hooks/pre-commit'
]));

gulp.task('typings:install', shell.task('typings install'));

var npm_deps = ['angular2', 'rxjs', 'angular2-uuid'];

gulp.task('clean:deps', () => {
  return gulp.src(`node_modules/{${npm_deps.join(',')}}`, {read: false}).pipe(clean({force: true}));
});

gulp.task('copy:deps', ['clean:deps'], () => {
  return gulp.src(`jspm_packages/npm/{${npm_deps.join(',')}}@*/**/*`)
    .pipe(rename((path) => { path.dirname = path.dirname.replace(/^([\w-]+)@[^/]+/, '$1'); }))
    .pipe(gulp.dest('node_modules'));
});
