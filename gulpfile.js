var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    merge = require('merge2'),
    sass = require('gulp-sass'),
    replace = require('gulp-replace'),
    filter = require('gulp-filter'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    wrap = require('gulp-wrap'),
    precompileHandlebars = require('gulp-precompile-handlebars');

var fs = require('fs'), path = require('path');
const { spawn } = require('child_process');

var serverInstance;

gulp.task('default', ['watch']);

// Watch Files For Changes
gulp.task('watch', ['move', 'styles', 'templates', 'scripts', 'server'], function() {
  gulp.watch('public/js/**/!(bundle.js)*.js', ['scripts']);
  gulp.watch(['./app.js'/*, './lib/** /*.js'*/], ['server']);
  gulp.watch('public/css/**/*.scss', ['styles']);  
  gulp.watch('public/js/views/templates/*.js', ['templates']);
});

gulp.task('move', function() {
  gulp.src([
    'node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.*',
    'node_modules/font-awesome/fonts/*'
   ])
    .pipe(gulp.dest('public/fonts'));

  gulp.src(['node_modules/icheck/skins/**/*.png'])
  .pipe(gulp.dest('public/img/icheck-skins'));
});

gulp.task('styles', function () {
  var sassStream = gulp.src([
    'node_modules/font-awesome/scss/font-awesome.scss',
    'node_modules/select2/src/scss/core.scss',
    'public/css/sass/main.scss',
   ])
   .pipe(sourcemaps.init())
   .pipe(sass({
     includePaths: [path.join(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets')],
   }).on('error', sass.logError));

  var imgRebaseFilter = filter(['node_modules/icheck/skins/flat/*.css'], {restore: true});
  var imgRebaseFilter2 = filter(['node_modules/datatables.net-dt/css/jquery.dataTables.css'], {restore: true});
  var cssStream = gulp.src([
      'public/css/custom/**/*.css',
      'node_modules/bootstrap-daterangepicker/daterangepicker.css',
      'node_modules/eonasdan-bootstrap-datetimepicker/src/sass/bootstrap-datetimepicker-build.scss',
      'node_modules/bootstrap-progressbar/scss/bootstrap-progressbar-3.3.0-3.x.x.scss',
      'node_modules/icheck/skins/flat/*.css',
      'node_modules/datatables.net-dt/css/jquery.dataTables.css',
      'node_modules/datatables.net-fixedheader-dt/css/fixedHeader.dataTables.min.css',
    ])
    .pipe(imgRebaseFilter)
    .pipe(replace(/url[(]/g, 'url(/img/icheck-skins/flat/'))
    .pipe(imgRebaseFilter.restore)
    .pipe(imgRebaseFilter2)
    .pipe(replace(/url[(]["]\.\.\/images/g, 'url("/img/datatable'))
    .pipe(imgRebaseFilter2.restore)
    /*.pipe(cleanCSS({
      rebase: true,
      target: './public/css',
      root: './public'
    }))*/
    .pipe(sourcemaps.init());

  return merge(
      cssStream,
      sassStream
    )
    .pipe(concat('bundle.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('templates', function(){
    gulp.src('public/js/views/templates/*.hbs')
      .pipe(precompileHandlebars())
      .pipe(wrap('templates[<%= processPartialName(file.relative) %>] = template(<%= contents %>); ', {}, {
        imports: {
          processPartialName: function(fileName) {
            // Strip the extension
            // Escape the output with JSON.stringify 
            return JSON.stringify(path.basename(fileName, '.hbs'));
          }
        }
      }))
      .pipe(concat('templates.js'))
      .pipe(wrap('(function() { var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};'+
          '<%= contents %> })();'
      ))
      .pipe(gulp.dest('public/js'));
});

gulp.task('scripts', function() {
  var b = browserify({
    entries: ['./public/js/entry.js'],
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())    
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('server', function () {
  if (serverInstance) {
    serverInstance.kill();
  }

  serverInstance = spawn('node', ['app.js']);
  serverInstance.on('close', function (code, signal) {
    //if (8 == code) {
    console.log(`Error ${code} (signal ${signal}) detected, waiting for new changes...`);
    //}
  });
  /*var log = fs.createWriteStream('server.log', {flags: 'a'});
  server.stdout.pipe(log);
  server.stderr.pipe(log);*/
});

