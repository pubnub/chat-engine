const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const package = require('./package.json');

// task
gulp.task('compile', function () {

    browserify({
        entries: ['./src/window.js'],
        debug: true
    })
    .bundle()
    .pipe(source('chat-engine.js'))
    .pipe(gulp.dest('./dist/latest/'))
    .pipe(gulp.dest('./dist/v/' + package.version));

});

gulp.task('default', ['compile']);

gulp.task('watch', function() {
  gulp.watch('./src/*', ['compile']);
});
