'use strict';

var es           = require( 'event-stream' );
var del          = require( 'del' );
var browserSync  = require( 'browser-sync' ).create();

var browserify  = require( 'browserify' );
var babelify    = require( 'babelify' );
var source      = require( 'vinyl-source-stream' );
var buffer      = require( 'vinyl-buffer' );

var postcss      = require( 'gulp-postcss' );
var autoprefixer = require( 'autoprefixer' );
var mqpacker     = require( 'css-mqpacker' );
var csswring     = require( 'csswring' );

var gulp         = require( 'gulp' );
var plumber      = require( 'gulp-plumber' );
var rename       = require( 'gulp-rename' );
var sass         = require( 'gulp-sass' );
var uglify       = require( 'gulp-uglify' );

var runSequence  = require( 'run-sequence' ).use( gulp );


var AUTOPREFIXER_BROWSERS = {
  browsers: [
    'ie >= 11',
    'safari >= 7',
    'ios >= 7',
    'android >= 4'
  ]
};


gulp.task( 'browser-sync', function () {

  browserSync.init({
    server: {
      baseDir: './',
      directory: true
    }
  } );

} );

gulp.task( 'clean', function () {

  del( './build/' );

} );



gulp.task( 'copy-static', function () {

  return gulp.src( [
    './static/**',
  ] )
  .pipe( gulp.dest( './build/' ) );

} );




gulp.task( 'sass', function () {

  var processors = [
    autoprefixer( AUTOPREFIXER_BROWSERS ),
    mqpacker,
    csswring
  ];

  return gulp.src( './src/assets/scss/style.scss' )
  .pipe( plumber( {
    errorHandler: function( err ) {

      console.log( err.messageFormatted );
      this.emit( 'end' );

    }
  } ) )
  .pipe( sass() )
  .pipe( gulp.dest( './build/assets/css/' ) )
  .pipe( rename( { extname: '.min.css' } ) )
  .pipe( postcss( processors ) )
  .pipe( gulp.dest( './build/assets/css/' ) );

} );


gulp.task( 'browserify', function () {

  var bundler = browserify( {
    entries: './src/assets/js/main.js',
    // standalone: 'main'
    transform: [
      [ 'babelify', {
        presets: [ 'es2015' ],
      } ],
      'glslify'
    ]
  } );

  bundler.bundle()
  .on( 'error', function( err ) {

    console.log( 'Error : ' + err.message );

  } )
  .pipe( source( 'main.js' ) )
  .pipe( buffer() )
  .pipe( gulp.dest( './build/assets/js/' ) )
  .pipe( uglify( { preserveComments: 'some' } ) )
  .pipe( rename( { extname: '.min.js' } ) )
  .pipe( gulp.dest( './build/assets/js/' ) )
  .pipe( browserSync.reload( { stream: true } ) );

  return bundler;

} );



gulp.task( 'watch', function () {

  gulp.watch( [ './**/*.html' ], function () {
    runSequence( browserSync.reload );
  } );

  gulp.watch( [ './src/assets/scss/*.scss' ], function () {
    runSequence( 'sass', browserSync.reload );
  } );

  gulp.watch( [
    './src/assets/js/**/*.js',
    './src/assets/js/**/*.vs',
    './src/assets/js/**/*.fs'
  ], function () {
    runSequence( 'browserify' );
  } );

} );

gulp.task( 'default', function ( callback ) {

  runSequence( 'browser-sync', [ 'copy-static', 'sass', 'browserify' ], 'watch', callback );

} );

gulp.task( 'build', function ( callback ) {

  runSequence( 'clean', [ 'copy-static', 'sass', 'browserify' ], callback );

} );
