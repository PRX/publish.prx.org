'use strict';

const gulp        = require('gulp');
const clean       = require('gulp-clean');
const seq         = require('gulp-sequence');
const rename      = require('gulp-rename');
const KarmaServer = require('karma').Server

const jspm = require('./lib/jspm');

// Build tasks
gulp.task('build:dev',  seq('copy:deps', 'jspm:bundle:dev', 'jspm:unbundle:dev'));
gulp.task('build:dist', ['jspm:bundle:dist']);

// JSPM bundle tasks
let devInclude = ['capaj/systemjs-hot-reloader', 'plugin-typescript'];
let devExclude = ['app', 'config', 'util'];
gulp.task('jspm:bundle:dev',   jspm.bundle('.dev/vendor.js', devInclude, devExclude));
gulp.task('jspm:bundle:test',  jspm.bundle('.dev/main.js'));
gulp.task('jspm:bundle:dist',  jspm.bundleSfx('.dist/publish.min.js'));
gulp.task('jspm:unbundle:dev', jspm.unbundle('systemjs.vendor.js'));
gulp.task('jspm:unbundle',     jspm.unbundle());

// Dependency copying to make atom happy
var npm_deps = ['@angular', 'rxjs', 'angular2-uuid', 'ng2-dragula'];
gulp.task('clean:deps', () => {
  return gulp.src(`node_modules/{${npm_deps.join(',')}}`, {read: false}).pipe(clean({force: true}));
});
gulp.task('copy:deps', ['clean:deps'], () => {
  return gulp.src(`jspm_packages/npm/{${npm_deps.join(',')}}*/**/*`)
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace(/^([\w-]+)@[^/]+/, '$1');
      path.dirname = path.dirname.replace(/^@angular\/([\w-]+)@[^/]+/, '@angular/$1');
    }))
    .pipe(gulp.dest('node_modules'));
});

// Testing
const karmaItUp = (configFile, singleRun) => {
  return (done) => {
    let f = `${__dirname}/config/${configFile}`;
    new KarmaServer({configFile: f, singleRun: singleRun}, done).start();
  };
}
gulp.task('test',      karmaItUp('karma.dev.js', true));
gulp.task('tdd',       karmaItUp('karma.dev.js', false));
gulp.task('test:dist', karmaItUp('karma.dist.js', true));
gulp.task('ci',        seq('jspm:bundle:test', 'test:dist', 'jspm:unbundle'));
