const gulp = require('gulp');
const uglify = require("gulp-uglify");
 
// task
gulp.task('minify-js', function () {
    gulp.src('./src/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify-js']);
