const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const packageJSON = require('./package.json');
const eslint = require('gulp-eslint');

// task
gulp.task('compile', () => {

    browserify({ entries: ['./src/window.js'], debug: true })
        .bundle()
        .pipe(source('chat-engine.js'))
        .pipe(gulp.dest('./dist/latest/'))
        .pipe(gulp.dest('./dist/v/' + packageJSON.version));

});

gulp.task('lint_code', [], () => gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('default', ['compile']);
gulp.task('lint', ['lint_code']);
gulp.task('test', ['lint']);

gulp.task('watch', () => {
    gulp.watch('./src/*', ['compile']);
});
