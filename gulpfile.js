const gulp = require('gulp');
const packageJSON = require('./package.json');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');
const runSequence = require('run-sequence');
const webpack = require('webpack-stream');

// task
gulp.task('compile', () => {
    return gulp.src('src/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/latest/'))
        .pipe(gulp.dest('./dist/v/' + packageJSON.version));

});

gulp.task('lint_code', [], () => {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint_tests', [], () => {
    return gulp.src(['test/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('run_tests', () => {
    return gulp.src(['test/unit/**/*.test.js', 'test/integration/**/*.test.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(istanbul.writeReports());
});

gulp.task('default', ['compile']);

gulp.task('validate', ['lint_code', 'lint_tests']);

gulp.task('pre-test', () => {
    return gulp.src(['src/**/*.js'])
        .pipe(istanbul({ instrumenter: isparta.Instrumenter, includeAllSources: true }))
        .pipe(istanbul.hookRequire());
});

gulp.task('test', (done) => {
    runSequence('pre-test', 'run_tests', 'validate', done);
});

gulp.task('watch', () => {
    runSequence('compile');
    gulp.watch('src/**/*.js', ['compile']);
});
