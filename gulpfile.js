const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

// task
gulp.task('compile', function () {
    
    browserify({
        entries: ['window.js'],
        debug: true
    })
    .bundle()
    .pipe(source('ocf.js'))
    .pipe(gulp.dest('./web/'));

});

gulp.task('default', ['compile']);
