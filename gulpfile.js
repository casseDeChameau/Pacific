// ? ------------------------------------------------------------------------ BASE SETTING MADE WITH OLIFYÉÉÉ
// ? ----------- MULTI DEVICE BROWSER-SYNC / SASS / MNIFYING / IMAGE COMPRESSION
// ----------- VARIABLES
var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
const image = require('gulp-image');
const autoprefixer = require('gulp-autoprefixer');

sass.compiler = require('node-sass');

// ---------- FUNCTIONS

// Moulinette SCSS
gulp.task('moulinette-sass', function() {
    return gulp.src('./src/css/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(gulp.dest('./dist/css'));
});
// Moulinette html
gulp.task('moulinette-html', function() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./dist'));
});

// Moulinette JS (Uglify > minify JS)
gulp.task('moulinette-js', function() {
    return pipeline(
        gulp.src('./src/js/*.js'),
        uglify(),
        rename({
            extname: ".min.js"
        }),
        gulp.dest('./dist/js')
    );
});
// Uglify sans pipeline
// gulp.task('moulinette-js', function() {
//     return gulp.src('./src/js/*.js')
//         .pipe(uglify())
//         .pipe(rename({
//             extname: ".min.js"
//         }))
//         .pipe(gulp.dest('./dist/js'));
// });

// BrowserSync - Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});
// gulp image
// with compressing options
gulp.task('compress-img', function() {
    gulp.src('./src/img/*')
        .pipe(image({
            pngquant: true,
            optipng: true,
            zopflipng: true,
            jpegRecompress: true,
            mozjpeg: true,
            gifsicle: true,
            svgo: true,
            concurrent: 10,
            quiet: false // compressed size gain indicator
        }))
        .pipe(gulp.dest('./dist/img'));
});



// ? -------------------------------------------------------------- FAVICON: 
var realFavicon = require('gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: './src/img/favicon-cassedechameau.png',
        dest: './dist/img/icons',
        iconsPath: 'img/icons',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#ffffff',
                margin: '14%',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {
                design: 'raw'
            },
            windows: {
                pictureAspect: 'whiteSilhouette',
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'shadow',
                themeColor: '#ffffff',
                manifest: {
                    name: 'casseDeChameau',
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: false,
            usePathAsIs: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    return gulp.src(['dist/*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('dist'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});


// ? -------------------------------------------------------------------------EXECUTION
gulp.task('execute',
    gulp.parallel(
        'moulinette-sass',
        'moulinette-html',
        'moulinette-js',
        'inject-favicon-markups',
        'inject-favicon-markups',
        'browser-sync',
        function() {
            // gulp update dist files from src changment 
            gulp.watch('./src/*.html', gulp.task('moulinette-html'));
            gulp.watch('./src/css/**/*.scss', gulp.task('moulinette-sass'));
            gulp.watch('./src/js/*.js', gulp.task('moulinette-js'));
            // browser sync watch dist changments
            gulp.watch("./dist/*.html").on('change', browserSync.reload);
            gulp.watch("./dist/css/*.css").on('change', browserSync.reload);
            gulp.watch("./dist/js/*.js").on('change', browserSync.reload);
        }));

// makes command gulp + enter do execute code (all that must be run whenever a page is modified)
gulp.task('default', gulp.parallel('execute'));

// todo for images:  "gulp compress-img" once and for each time img is added
// throw error but do the job so it s ok(maybe see async signal completion doc on gulpjs.com)
// todo for favicon: "gulp generate-favicon"
// if trouble look down to updates
// todo: "gulp" again after above tasks run to execute watching