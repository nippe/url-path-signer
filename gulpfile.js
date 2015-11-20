var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');


gulp.task('mocha', function(){
	return gulp.src(['test/*.js'], {read: false})
		.pipe(mocha({
			reporter: 'spec',
			globals: {
				should: require('should')
			}
		}));
});

gulp.task('watch-mocha', function(){
	gulp.watch(['lib/**', 'test/**'], ['mocha']);
});
