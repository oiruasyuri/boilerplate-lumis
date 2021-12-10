const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const copy = require('gulp-copy');
const fileInclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

function clean() {
  return del('./www/**/*')
}

async function serve() {
  browserSync.init({ server: './www' })

  gulp.watch('./src/**/*.html', buildHtml)
  gulp.watch('./src/assets/images/**/*', buildImages)
  gulp.watch(['./src/assets/scripts/*.js', './src/pages/**/*.js'], buildJavascript)
  gulp.watch('./src/assets/styles/**/*.scss', buildSass)
  gulp.watch('./src/assets/scripts/vendor/**/*.js', buildVendor)

  gulp.watch('./www/**/*').on('change', browserSync.reload)
}

async function buildHtml() {
  gulp
    .src(['./src/**/*.html', '!./src/**/_*.html'])
    .pipe(fileInclude())
    .pipe(copy('./www', { prefix: 3 }))
    .pipe(gulp.dest('./www'))
    .pipe(browserSync.stream())
}

async function buildImages() {
  gulp
    .src('./src/assets/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./www/assets/img'))
    .pipe(browserSync.stream())
}

async function buildJavascript() {
  gulp
    .src(['./src/assets/scripts/*.js', './src/pages/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(concat('bundle.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./www/assets/scripts'))
    .pipe(browserSync.stream())
}

async function buildSass() {
  gulp
    .src('./src/assets/styles/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'] }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./www/assets/css'))
    .pipe(browserSync.stream())
}

async function buildVendor() {
  gulp
    .src('./src/assets/scripts/vendor/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./www/assets/scripts/vendor'))
    .pipe(browserSync.stream())
}

gulp.task('default', gulp.series(clean, gulp.parallel(buildHtml, buildImages, buildJavascript, buildSass, buildVendor), serve))