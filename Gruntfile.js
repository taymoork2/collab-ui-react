'use strict';

module.exports = function (grunt) {

  grunt.util.linefeed = '\n';

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var appConfig = require('./build.config.js');

  // var connectConfig = {
  //   app: require('./bower.json').appPath || 'app',
  //   build: require('./bower.json').appPath || 'build',
  //   dist: 'dist'
  // };

  var taskConfig = {

    pkg: grunt.file.readJSON('package.json'),

    css_name: 'main',

    js_index_name: 'index.scripts',

    js_unsupported_name: 'unsupported.scripts',

    meta: {
      banner: '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses %> \n' +
        ' */\n'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 9']
      },
      build: {
        files: [{
          expand: true,
          cwd: '<%= build_dir %>/styles/',
          src: '*.css',
          dest: '<%= build_dir %>/styles/'
        }]
      }
    },

    // Clean up the build directories before building
    clean: {
      build: '<%= build_dir %>',
      coverage: 'coverage',
      dist: '<%= compile_dir %>',
      screenshots: 'screenshots',
      test: '<%= e2e_dir %>/reports'
    },

    // Concatenate CSS and JS source files into single files
    concat: {
      compile_css: {
        src: [
          '<%= vendor_files.css %>',
          '<%= build_dir %>/styles/<%= css_name %>.css'
        ],
        dest: '<%= compile_dir %>/styles/<%= css_name %>.css'
      },

      compile_js: {
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/scripts/**/*.js',
          '!<%= build_dir %>/scripts/unsupported.js',
          '<%= build_dir %>/modules/**/*.js',
          '<%= html2js.app.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/scripts/<%= js_index_name %>.js'
      },

      compile_unsupported_js: {
        src: [
          '<%= vendor_files.unsupported %>',
          '<%= build_dir %>/<%= unsupported_app %>/scripts/**/*.js'
        ],
        dest: '<%= compile_dir %>/scripts/<%= js_unsupported_name %>.js'
      }
    },

    // The actual grunt server settings
    connect: {
      livereload: {
        options: {
          livereload: 35729,
          open: true,
          base: '<%= build_dir %>'
        }
      },
      test: {
        options: {
          base: [
            '<%= test_dir %>',
            '<%= compile_dir %>'
          ]
        }
      },
      test_build: {
        options: {
          base: [
            '<%= test_dir %>',
            '<%= build_dir %>'
          ]
        }
      },
      test_coverage: {
        options: {
          base: [
            '<%= test_dir %>',
            '<%= coverage_dir %>/<%= app_dir %>'
          ]
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= compile_dir %>'
        }
      }
    },

    /**
     * Copy project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      coverage: {
        files: [{
          src: '**/**',
          cwd: '<%= build_dir %>',
          dest: '<%= coverage_dir %>/<%= app_dir %>',
          dot: true,
          expand: true
        }]
      },
      build_app_files: {
        files: [{
          src: [
            '*.{ico,png,txt,html}',
            'images/**/*',
            '<%= app_files.js %>',
            '<%= app_files.json %>',
            '.htaccess'
          ],
          dest: '<%= build_dir %>/',
          cwd: '<%= app_dir %>',
          expand: true,
          dot: true
        }]
      },
      build_unsupported_app_js: {
        files: [{
          src: [
            '<%= app_files.js %>'
          ],
          dest: '<%= build_dir %>/<%= unsupported_app %>',
          cwd: '<%= unsupported_app_dir %>',
          expand: true,
          dot: true
        }]
      },
      build_unsupported_app_html: {
        files: [{
          src: [
            '<%= app_files.html %>'
          ],
          dest: '<%= build_dir %>',
          cwd: '<%= unsupported_app_dir %>',
          expand: true,
          dot: true
        }]
      },
      build_testjs: {
        files: [{
          src: ['<%= test_files.js %>', '<%= test_dir %>/**/*.js'],
          dest: '<%= build_dir %>',
          expand: true
        }]
      },
      build_vendor_fonts: {
        files: [{
          src: ['<%= vendor_files.fonts %>'],
          dest: '<%= build_dir %>/fonts',
          expand: true,
          flatten: true
        }]
      },
      build_vendor_images: {
        files: [{
          src: ['<%= vendor_files.images %>'],
          dest: '<%= build_dir %>',
          expand: true
        }]
      },
      build_vendor_css: {
        files: [{
          src: ['<%= vendor_files.css %>'],
          dest: '<%= build_dir %>/',
          expand: true
        }]
      },
      build_vendorjs: {
        files: [{
          src: ['<%= vendor_files.js %>'],
          dest: '<%= build_dir %>',
          expand: true
        }]
      },
      compile_app_files: {
        files: [{
          src: [
            '*.{ico,png,txt,html}',
            'scripts/unsupported.js',
            'images/**/*',
            '.htaccess',
            '<%= app_files.json %>'
          ],
          dest: '<%= compile_dir %>/',
          cwd: '<%= app_dir %>',
          expand: true,
          dot: true
        }]
      },
      compile_unsupported_app_files: {
        files: [{
          src: [
            '<%= app_files.html %>'
          ],
          dest: '<%= compile_dir %>',
          cwd: '<%= unsupported_app_dir %>',
          expand: true,
          dot: true
        }]
      },
      compile_fonts: {
        files: [{
          src: ['*'],
          dest: '<%= compile_dir %>/fonts',
          cwd: '<%= build_dir %>/fonts/',
          expand: true
        }]
      },
      compile_images: {
        files: [{
          src: ['*'],
          dest: '<%= compile_dir %>/images',
          cwd: '<%= build_dir %>/images/',
          expand: true
        }]
      },
      compile_bluepng: {
        files: [{
          src: 'blue.png',
          dest: '<%= compile_dir %>/styles',
          cwd: 'bower_components/jquery-icheck/skins/square',
          expand: true,
          flatten: true
        }]
      }
    },

    // Minify CSS for production
    cssmin: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          report: 'min',
          keepSpecialComments: 0
        },
        files: [{
          expand: true,
          cwd: '<%= compile_dir %>/styles/',
          src: ['*.css', '!*.min.css'],
          dest: '<%= compile_dir %>/styles/'
        }]
      }
    },

    /**
     * Compile all template files and places them into JavaScript files as
     * strings that are added to AngularJS's template cache.
     */
    html2js: {
      app: {
        options: {
          base: 'app',
          quoteChar: '\'',
          useStrict: true
        },
        src: ['<%= app_dir %>/<%= app_files.atpl %>'],
        dest: '<%= build_dir %>/templates-app.js'
      }
    },

    // HTML Lint template files before building
    htmlangular: {
      options: {
        tmplext: 'tpl.html',
        customtags: '<%= html_lint.customtags %>',
        customattrs: '<%= html_lint.customattrs %>',
        relaxerror: '<%= html_lint.relaxerror %>',
        reportpath: null
      },
      files: {
        src: ['<%= app_dir %>/modules/**/*.tpl.html'],
      },
    },

    // Minify HTML files for production
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= compile_dir %>',
          src: ['*.html'],
          dest: '<%= compile_dir %>'
        }]
      }
    },

    imagemin: {
      vendor: {
        files: [{
          expand: true,
          src: ['<%= vendor_files.images %>'],
          dest: '<%= build_dir %>'
        }]
      },
      app: {
        files: [{
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= build_dir %>',
          cwd: '<%= app_dir %>',
          expand: true
        }]
      }
    },

    /**
     * The `htmlprocess` task compiles html files as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    htmlprocess: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build_index: {
        file: 'index.html',
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/scripts/**/*.js',
          '<%= build_dir %>/modules/**/*.module.js',
          '<%= build_dir %>/modules/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/styles/<%= css_name %>.css'
        ]
      },

      build_unsupported: {
        file: 'unsupported.html',
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.unsupported %>',
          '<%= build_dir %>/<%= unsupported_app %>/scripts/**/*.js'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile_index: {
        file: 'index.html',
        dir: '<%= compile_dir %>',
        src: [
          '<%= compile_dir %>/scripts/<%= js_index_name %>.js',
          // '<%= vendor_files.css %>',
          '<%= compile_dir %>/styles/<%= css_name %>.css'
        ]
      },

      compile_unsupported: {
        file: 'unsupported.html',
        dir: '<%= compile_dir %>',
        src: [
          '<%= compile_dir %>/scripts/<%= js_unsupported_name %>.js',
          // '<%= vendor_files.css %>',
          '<%= compile_dir %>/styles/<%= css_name %>.css'
        ]
      }
    },

    // Reformat JS app files before checking in
    jsbeautifier: {
      beautify: {
        src: [
          '<%= app_dir %>/**/*.js',
          '<%= app_dir %>/**/*.json',
          '<%= test_dir %>/**/*.js',
          '<%= test_dir %>/**/*.json',
          '!test/karma-unit.js',
          'karma.conf.js',
          'Gruntfile.js'
        ],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: [
          '<%= app_dir %>/**/*.js',
          '<%= app_dir %>/**/*.json',
          '<%= test_dir %>/**/*.js',
          '<%= test_dir %>/**/*.json',
          '!test/karma-unit.js',
          'karma.conf.js',
          'Gruntfile.js'
        ],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      app: [
        '<%= app_dir %>/scripts/**/*.js',
        '<%= app_dir %>/modules/**/*.js'
        // '<%= app_dir %>/**/*.json',
        // '<%= test_dir %>/**/*.json',
      ],
      // unsupported_app: [
      //   '<%= unsupported_app_dir %>/**/*.js'
      // ],
      test: [
        '<%= test_dir %>/**/*.js',
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        jshintrc: 'config/jshint.json',
        // reporter: require('jshint-stylish')
      },
      // globals: {}
    },

    eslint: {
      options: {
        configFile: 'config/eslint.json',
        rulePaths: ['config/rules']
      },
      squared: ['test/e2e-protractor/squared/*_spec.js'],
      huron: ['test/e2e-protractor/huron/*_spec.js']
    },

    // Compile the main Less file into the build directory
    less: {
      build: {
        files: {
          '<%= build_dir %>/styles/<%= css_name %>.css': '<%= app_dir %>/<%= app_files.less %>'
        }
      }
    },

    /**
     * Replace the depreciated `ng-min` with `ng-annotate`
     * `ng-annotate` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      compile: {
        files: [{
          expand: true,
          src: ['<%= app_files.js %>'],
          cwd: '<%= build_dir %>',
          dest: '<%= build_dir %>',
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        src: [
          '<%= compile_dir %>/scripts/{,*/}*.js',
          '<%= compile_dir %>/styles/{,*/}*.css',
          // '<%= compile_dir %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= compile_dir %>/styles/fonts/*'
        ]
      }
    },

    // Minify and uglify the JavaScript sources
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          beautify: false,
          mangle: false
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>',
          '<%= concat.compile_unsupported_js.dest %>': '<%= concat.compile_unsupported_js.dest %>',
          '<%= compile_dir %>/scripts/unsupported.js': '<%= compile_dir %>/scripts/unsupported.js'
        }
      }
    },

    /**
     * Reads HTML for usemin blocks to enable smart builds that automatically
     * concat, minify and revision files. Creates configurations in memory so
     * additional tasks can operate on them
     */
    useminPrepare: {
      'index-html': {
        src: ['<%= temp_dir %>/index.html'],
        options: {
          dest: '<%= compile_dir %>'
        }
      },
      'unsupported-html': {
        src: ['<%= temp_dir %>/unsupported.html'],
        options: {
          dest: '<%= compile_dir %>'
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= compile_dir %>/{,*/}*.html'
      ],
      css: ['<%= compile_dir %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= compile_dir %>', '<%= compile_dir %>/images']
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true,
        livereloadOnError: false
      },
      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      appjs: {
        files: [
          '<%= app_dir %>/scripts/**/*.js',
          '<%= app_dir %>/modules/**/*.js',
          '<%= app_dir %>/**/*.json'
        ],
        tasks: [
          'copy:build_app_files',
          'htmlprocess_build',
          'karma:unit:run'
        ],
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: ['<%= app_dir %>/<%= app_files.html %>'],
        tasks: [
          'copy:build_app_files',
          'htmlprocess_build'
        ]
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      unsupported_appjs: {
        files: [
          '<%= unsupported_app_dir %>/scripts/**/*.js'
        ],
        tasks: [
          // 'jshint:unsupported_app',
          'copy:build_unsupported_app_js',
          'htmlprocess_build',
          'karma:unit:run'
        ],
      },

      /**
       * When unsupported.html changes, we need to compile it.
       */
      unsupported_html: {
        files: ['<%= unsupported_app_dir %>/<%= app_files.html %>'],
        tasks: [
          'copy:build_unsupported_app_html',
          'htmlprocess_build'
        ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: ['<%= app_dir %>/<%= app_files.atpl %>'],
        tasks: [
          'html2js',
          'htmlprocess_build',
        ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      less: {
        files: [
          '<%= app_dir %>/<%= app_files.less %>',
          '<%= app_dir %>/**/*.less',
          '**/*.less'
        ],
        tasks: [
          'less:build',
          'autoprefixer:build',
          'htmlprocess_build',
        ]

      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= app_files.jsunit %>'
        ],
        tasks: [
          'jshint:test',
          'karma:unit:run'
        ],
        options: {
          livereload: false
        }
      }
    },

    // Unit Test settings
    karma: {
      options: {
        configFile: '<%= test_dir %>/karma-unit.js'
      },
      unit: {
        port: 9019,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    // Compile the karma template so that changes to its file array aren't managed manually
    karmaconfig: {
      unit: {
        dir: '<%= test_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= test_files.js %>'
        ]
      }
    },

    //End 2 End Testing Settings
    protractor: {
      options: {
        configFile: 'protractor-config.js',
        keepAlive: false,
        noColor: false
      },
      squared: {
        options: {
          args: {
            specs: [
              'test/e2e-protractor/squared/*_spec.js'
            ],
            capabilities: {
              maxInstances: 1
            }
          }
        }
      },
      huron: {
        options: {
          // Don't fail on error
          keepAlive: true,
          args: {
            specs: [
              'test/e2e-protractor/huron/*_spec.js'
            ]
          }
        }
      },
      hercules: {
        options: {
          // Don't fail on error
          keepAlive: true,
          args: {
            specs: [
              'test/e2e-protractor/hercules/*_spec.js'
            ]
          }
        }
      },
      webex: {
        options: {
          // Don't fail on error
          keepAlive: true,
          args: {
            specs: [
              'test/e2e-protractor/webex/*_spec.js'
            ]
          }
        }
      }
    },

    instrument: {
      files: [
        'app/**/*.js'
      ],
      options: {
        basePath: '<%= coverage_dir %>'
      }
    },

    protractor_coverage: {
      options: {
        configFile: 'protractor-config.js',
        noColor: false,
        coverageDir: '<%= coverage_dir %>',
        args: {
          browser: 'chrome'
        }
      },
      coverage: {
        options: {
          args: {
            specs: [
              'test/e2e-protractor/**/*_spec.js'
            ]
          }
        }
      }
    },

    makeReport: {
      src: '<%= coverage_dir %>/*.json',
      options: {
        type: 'lcov',
        dir: 'coverage/e2e-protractor'
      }
    },

    sonarRunner: {
      analysis: {
        options: {
          sonar: {
            host: {
              url: 'http://172.27.27.150:9000'
            },
            jdbc: {
              url: 'jdbc:mysql://172.27.27.150:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance',
              username: 'sonar',
              password: 'sonar'
            },
            projectKey: 'com.cisco.wx2:admin-web-client',
            projectName: 'Admin Web Client',
            projectVersion: '1.0-SNAPSHOT',
            sources: 'app',
            language: 'js',
            javascript: {
              lcov: {
                reportPath: 'coverage/e2e-protractor/lcov.info'
              }
            }
          }
        }
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 30000,
          'async-only': true
        },
        src: ['test/api_sanity/**/*_test.coffee'],
        require: 'coffee-script/register'
      }
    }
  };

  // Load grunt tasks automatically from package.json
  require('load-grunt-tasks')(grunt, {
    scope: [
      'devDependencies',
      'dependencies'
    ]
  });

  // Create the initConfig from taskConfig and appConfig
  grunt.initConfig(grunt.util._.extend(taskConfig, appConfig));

  // Start server to preview Build and Dist directories
  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'compile',
        'connect:dist:keepalive'
      ]);
    }
    grunt.task.run([
      'build',
      'karma:unit',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  // Create default grunt task
  grunt.registerTask('default', [
    'build',
    'compile'
  ]);

  // Build files into the build folder for development
  grunt.registerTask('build', [
    'clean:build',
    'html2js',
    'js_beautify',
    'less',
    'copy_build',
    'imagemin',
    'autoprefixer',
    'htmlprocess_build',
    'karmaconfig',
    'karma:continuous',
  ]);

  // Build files into the dist folder for production
  grunt.registerTask('compile', [
    'clean:dist',
    'copy_compile',
    'ngAnnotate',
    'concat',
    'htmlprocess_compile',
    'useminPrepare',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('htmlprocess_build', [
    'htmlprocess:build_index',
    'htmlprocess:build_unsupported',
  ]);

  grunt.registerTask('htmlprocess_compile', [
    'htmlprocess:compile_index',
    'htmlprocess:compile_unsupported',
  ]);

  // Format JS files
  grunt.registerTask('js_beautify', [
    'jshint',
    'jsbeautifier:beautify'
  ]);

  grunt.registerTask('jsb', function () {
    grunt.task.run(['js_beautify']);
  });

  // Check JS files for fomatting errors
  grunt.registerTask('js_verify', [
    'jshint',
    'jsbeautifier:verify'
  ]);

  // Copy the needed files into the build folder
  grunt.registerTask('copy_build', [
    'copy:build_app_files',
    'copy:build_unsupported_app_js',
    'copy:build_unsupported_app_html',
    'copy:build_vendor_css',
    'copy:build_vendor_fonts',
    'copy:build_vendor_images',
    'copy:build_vendorjs'
  ]);

  // Compile, concatenate, minify and copy app files for deployment
  grunt.registerTask('copy_compile', [
    'copy:compile_app_files',
    'copy:compile_unsupported_app_files',
    'copy:compile_fonts',
    'copy:compile_images',
    'copy:compile_bluepng'
  ]);

  grunt.registerTask('test-setup', function (target) {
    if (target === 'build') {
      return grunt.task.run([
        'clean',
        'build',
        'eslint',
        'connect:test_build'
      ]);
    } else if (target === 'coverage') {
      return grunt.task.run([
        'clean',
        'build',
        'eslint',
        'copy:coverage',
        'instrument',
        'connect:test_coverage'
      ]);
    }
    grunt.task.run([
      'clean',
      'build',
      'eslint',
      'compile',
      'connect:test'
    ]);
  });

  grunt.registerTask('test-squared', [
    'test-setup',
    'protractor:squared'
  ]);

  grunt.registerTask('test-huron', [
    'test-setup',
    'protractor:huron'
  ]);

  grunt.registerTask('test-hercules', [
    'test-setup',
    'protractor:hercules'
  ]);

  /**
    grunt.registerTask('test-webex', [
      'test-setup',
      'protractor:webex'
    ]);
  **/

  grunt.registerTask('test', function (target) {
    if (target === 'build') {
      return grunt.task.run([
        'test-setup:build',
        'protractor:squared',
        'protractor:hercules'
      ]);
    } else if (target === 'coverage') {
      return grunt.task.run([
        'test-setup:coverage',
        'protractor_coverage:coverage',
        'makeReport',
        'sonarRunner'
      ]);
    }
    grunt.task.run([
      'continue:on', // dont fail the build if mocha sanity tests fail
      'mochaTest',
      'continue:off',
      'test-setup:dist',
      'protractor:squared',
      'protractor:hercules'
    ]);
  });

  // A utility function to get all app JavaScript sources.
  function filterForJS(files) {
    return files.filter(function (file) {
      return file.match(/\.js$/);
    });
  }

  // A utility function to get all app CSS sources.
  function filterForCSS(files) {
    return files.filter(function (file) {
      return file.match(/\.css$/);
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask('htmlprocess', 'Process html templates', function () {

    var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
    var jsFiles = filterForJS(this.filesSrc).map(function (file) {
      return file.replace(dirRE, '');
    });
    var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy(this.data.dir + '/' + this.data.file, this.data.dir + '/' + this.data.file, {
      process: function (contents) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config('pkg.version')
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS(this.filesSrc);

    grunt.file.copy('karma.conf.js', grunt.config('test_dir') + '/karma-unit.js', {
      process: function (contents) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });

  grunt.registerTask('mocha', 'mochaTest');
};
