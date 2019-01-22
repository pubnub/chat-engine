const gulp = require('gulp');
const packageJSON = require('./package.json');
const clean = require('gulp-clean');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');
const runSequence = require('run-sequence');
const webpack = require('webpack-stream');
const jsdoc = require('gulp-jsdoc3');
const httpServer = require('http-server');
const path = require('path');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');

let sourceFiles = ['src/**/*.js'];
let testFiles = ['test/unit/**/*.js', 'test/integration/**/*.js'];
let pluginFiles = [
    '../chat-engine-emoji/src/plugin.js',
    '../chat-engine-gravatar/src/plugin.js',
    '../chat-engine-markdown/src/plugin.js',
    '../chat-engine-muter/src/plugin.js',
    '../chat-engine-online-user-search/src/plugin.js',
    '../chat-engine-open-graph/src/plugin.js',
    '../chat-engine-uploadcare/src/plugin.js',
    '../chat-engine-typing-indicator/src/plugin.js',
    '../chat-engine-unread-messages/src/plugin.js'];

let guideFiles = ['guide/**/*'];
let readme = ['README.md'];

// task
gulp.task('build_code', () => {
    return gulp.src('src/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', () => {
    return gulp.src(['dist'], { read: false })
        .pipe(clean());
});

gulp.task('minify_code', () => {
    return gulp.src('dist/chat-engine.js')
        .pipe(uglify({ mangle: false, compress: true }))
        .pipe(rename('chat-engine.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('lint_code', () => {
    return gulp.src(sourceFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint_tests', () => {
    return gulp.src(testFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('run_tests', () => {
    return gulp.src(testFiles, { read: false })
        .pipe(mocha({ reporter: 'spec', exit: true }))
        .pipe(istanbul.writeReports());
});

gulp.task('pre-test', () => {
    return gulp.src(sourceFiles)
        .pipe(istanbul({ instrumenter: isparta.Instrumenter, includeAllSources: true }))
        .pipe(istanbul.hookRequire());
});


gulp.task('validate', gulp.parallel('lint_code', 'lint_tests'));

gulp.task('test', gulp.series('pre-test', 'run_tests', 'validate'));

gulp.task('compile', gulp.series('clean', 'build_code', 'minify_code'));

gulp.task('watch', gulp.series('compile', () => {
    gulp.watch(sourceFiles, ['compile']);
}));

gulp.task('compile_docs', (cb) => {
    let config = require('./jsdoc.json');
    gulp.src(sourceFiles.concat(pluginFiles), { read: false })
        .pipe(jsdoc(config, cb));
});

gulp.task('watch_docs', () => {
    gulp.watch(sourceFiles.concat(guideFiles).concat(readme), ['compile_docs']);
});

gulp.task('serve_docs', gulp.series('compile_docs', () => {

    let server = httpServer.createServer({
        root: path.join(__dirname, 'docs'),
        robots: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
        }
    });

    server.listen(8080);

}));

gulp.task('default', gulp.series('compile'));

gulp.task('docs_dev', gulp.series('serve_docs', 'watch_docs'));
