var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('watch', function () {
    watch(
    ['src/**/*', 'lib/**/*'], 
    function() {
    	var sys = require('sys');
		var exec = require('child_process').exec;
		function puts(error, stdout, stderr) { sys.puts(stdout) }
		exec("tsc --out ../server/public/js/app.js src/app.ts", puts);
    }
    );
});