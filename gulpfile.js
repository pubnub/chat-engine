const gulp = require('gulp');
const packageJSON = require('./package.json');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');
const runSequence = require('run-sequence');
const webpack = require('webpack-stream');
const jsdoc = require('gulp-jsdoc3');
const httpServer = require('http-server');
const path = require('path');

let sourceFiles = ['src/**/*.js'];
let testFiles = ['test/unit/**/*.js', 'test/integration/**/*.js'];

// task
gulp.task('compile', () => {
    runSequence('docs');
    return gulp.src('src/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/latest/'))
        .pipe(gulp.dest('./dist/v/' + packageJSON.version));

});

gulp.task('lint_code', [], () => {
    return gulp.src(sourceFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint_tests', [], () => {
    return gulp.src(testFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('run_tests', () => {
    return gulp.src(testFiles, { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(istanbul.writeReports());
});

gulp.task('default', ['compile']);

gulp.task('validate', ['lint_code', 'lint_tests']);

gulp.task('pre-test', () => {
    return gulp.src(sourceFiles)
        .pipe(istanbul({ instrumenter: isparta.Instrumenter, includeAllSources: true }))
        .pipe(istanbul.hookRequire());
});

gulp.task('test', () => {
    runSequence('pre-test', 'run_tests', 'validate', () => {
        process.exit();
    });
});

gulp.task('docs', (cb) => {
    let config = require('./jsdoc.json');
    gulp.src(sourceFiles, { read: false })
        .pipe(jsdoc(config, cb));
});

gulp.task('watch', () => {
    runSequence('compile');
    gulp.watch(sourceFiles, ['compile']);
});

gulp.task('serve_docs', () => {

    let server = httpServer.createServer({
        root: path.join(__dirname, 'docs'),
        robots: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
        }
    });

    server.listen(8080);

});

gulp.task('docs_dev', () => {
    runSequence('serve_docs');
    runSequence('watch');
});
