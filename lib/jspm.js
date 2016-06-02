'use strict';
const gulp    = require('gulp');
const change  = require('gulp-change');
const shell   = require('gulp-shell');
const rename  = require('gulp-rename');

/**
 * Run jspm bundling commands
 */
exports.bundle = function bundle(outFile, includes, excludes) {
  let cmd = 'jspm bundle ./app/main ';
  if (includes) {
    includes = includes.map(s => `+ ${s}`).join(' ');
    cmd += `${includes} `;
  }
  if (excludes) {
    excludes = excludes.map(s => `- [${s}/**/*]`).join(' ');
    cmd += `${excludes} `;
  }
  cmd += `${outFile} --inject --log warn`;
  return shell.task([cmd]);
}

/**
 * Standalone bundle
 */
exports.bundleSfx = function bundle(outFile) {
  let cmd = `jspm bundle-sfx ./app/main ${outFile} --minify --no-mangle --log warn`;
  return shell.task([cmd]);
}

/**
 * Unbundle jspm, optionally saving the bundle in a separate file
 */
exports.unbundle = function unbundle(bundleFile) {
  if (!bundleFile) {
    return function() {
      return gulp.src('config/systemjs.config.js').pipe(shell(['jspm unbundle --log warn']));
    }
  }

  // write bundle to external file before unbundling
  return function() {
    return gulp.src('config/systemjs.config.js')
      .pipe(change(function(content) {
        let inBundles = false;
        let newContent = 'System.config({\n';
        for (let line of content.split('\n')) {
          if (line.match(/^  bundles:/)) { inBundles = true; }
          if (inBundles) {
            if (line.match(/^  }/)) {
              newContent += '  }\n';
              break;
            } else {
              newContent += line + '\n';
            }
          }
        }
        newContent += '});\n';
        return newContent;
      }))
      .pipe(rename(bundleFile))
      .pipe(gulp.dest('config'))
      .pipe(shell(['jspm unbundle --log warn']));
  };
}
