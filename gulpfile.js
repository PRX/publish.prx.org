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
gulp.task('postinstall',          seq('jspm:install', 'typings:install', 'git:hooks:install', 'copy:deps', 'jspm:bundle:dev'));
gulp.task('start:dev',            seq('build:dev', 'copy:deps', 'server:dev'));
gulp.task('start:dist',           seq('build:dist', 'server:dist'));

// Testing
gulp.task('test', function (done) {
  new KarmaServer({
    configFile: __dirname + '/config/karma.dev.js',
    singleRun: true
  }, done).start();
});
gulp.task('test:dist', ['jspm:bundle:test'], function (done) {
  new KarmaServer({
    configFile: __dirname + '/config/karma.dist.js',
    singleRun: true
  }, done).start();
});
gulp.task('tdd', function (done) {
  new KarmaServer({
    configFile: __dirname + '/config/karma.dev.js'
  }, done).start();
});

// Build tasks
gulp.task('build:dev', ['jspm:bundle:dev']);
gulp.task('build:dist', ['jspm:bundle:dist']);

// Server tasks
gulp.task('server:dev', shell.task(['node lib/server-dev.js']));
gulp.task('server:dist', shell.task(['node lib/server-dist.js']));

// JSPM bundle tasks
const nonbundle = ['- [app/**/*]', '- [config/**/*]', '- [util/**/*]'].join(' ');
gulp.task('jspm:bundle:dev', function() {
  return gulp.src('config/systemjs.config.js')
    .pipe(newer('.dev/vendor.js'))
    .pipe(shell(['jspm bundle ./app/main '+nonbundle+' ./.dev/vendor.js --inject --log warn']));
});
gulp.task('jspm:bundle:test', ['jspm:unbundle'], shell.task([
  'jspm bundle ./app/main ./.dev/main.js --inject --log warn'
]));
gulp.task('jspm:bundle:dist', shell.task([
  'jspm bundle-sfx ./app/main ./.dist/publish.min.js --minify --no-mangle --log warn'
]));
gulp.task('jspm:install',    shell.task('jspm install --log warn'));
gulp.task('jspm:unbundle',   shell.task('jspm unbundle --log warn'));

// Utility tasks
const loc = ['#!/bin/sh', 'PATH="/usr/local/bin:$PATH"', 'npm run git:hooks:pre-commit'];
gulp.task('git:hooks:install', function() {
  return gulp.src('.git/hooks')
    .pipe(shell([
      `printf '${loc.join('\n')}' > ./.git/hooks/pre-commit`,
      'chmod +x ./.git/hooks/pre-commit'
    ]));
});

gulp.task('typings:install', shell.task('typings install'));

var npm_deps = ['angular2', 'rxjs', 'angular2-uuid', 'ng2-dragula'];

gulp.task('clean:deps', () => {
  return gulp.src(`node_modules/{${npm_deps.join(',')}}`, {read: false}).pipe(clean({force: true}));
});

gulp.task('copy:deps', ['clean:deps'], () => {
  return gulp.src(`jspm_packages/npm/{${npm_deps.join(',')}}@*/**/*`)
    .pipe(rename((path) => { path.dirname = path.dirname.replace(/^([\w-]+)@[^/]+/, '$1'); }))
    .pipe(gulp.dest('node_modules'));
});
