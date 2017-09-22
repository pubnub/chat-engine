const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const packageJSON = require('./package.json');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');

// task
gulp.task('compile', () => {

    browserify({ entries: ['./src/window.js'], debug: true })
        .bundle()
        .pipe(source('chat-engine.js'))
        .pipe(gulp.dest('./dist/latest/'))
        .pipe(gulp.dest('./dist/v/' + packageJSON.version));

});

gulp.task('lint_code', [], () => {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
});

gulp.task('lint_tests', [], () => {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('unit_tests', () => {
    return gulp.src(['test/**/*.test.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('default', ['compile']);

gulp.task('validate', ['lint_code', 'lint_tests']);

gulp.task('test', (done) => {
    runSequence('unit_tests', 'validate', done);
});

gulp.task('watch', () => {
    gulp.watch('./src/*', ['compile']);
});
