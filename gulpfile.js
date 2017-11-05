let gulp      = require('gulp'), // Подключаем Gulp
    sass        = require('gulp-sass'), //Подключаем Sass пакет,
    autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
    concat      = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify      = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    babel       = require('gulp-babel');

gulp.task('sass', function() { // Создаем таск "sass"
  return gulp.src(['public/styles/sass/**/*.sass', 'public/styles/sass/**/*.scss']) // Берем источник
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest('public/styles/css')) // Выгружаем результата в папку css

  });

gulp.task('watch',['sass'], function() {
  gulp.watch(['public/styles/sass/**/*.sass', 'public/styles/sass/**/*.scss'], ['sass']); // Наблюдение за sass файлами в папке sass
});

gulp.task('default', ['watch']);
