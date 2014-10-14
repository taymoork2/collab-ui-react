'use strict';

module.exports = function(grunt) {

  grunt.util.linefeed = '\n';

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var appConfig = require('./build.config.js');

  var connectConfig = {
    app: require('./bower.json').appPath || 'app',
    build: require('./bower.json').appPath || 'build',
    dist: 'dist'
  };


  var taskConfig = {

    pkg: grunt.file.readJSON('package.json'),

    css_name: 'main',

    js_name: 'scripts',

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
      dist: '<%= compile_dir %>',
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
          '<%= build_dir %>/modules/**/*.js',
          '<%= html2js.app.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/scripts/<%= js_name %>.js'
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 8000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          port: 8000,
          base: '<%= build_dir %>'
        }
      },
      test: {
        options: {
          port: 8000,
          base: [
            '<%= test_dir %>',
            '<%= compile_dir %>'
          ]
        }
      },
      test_build: {
        options: {
          port: 8000,
          base: [
            '<%= test_dir %>',
            '<%= build_dir %>'
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
      build_app_files: {
        files: [{
          src: [
            '*.{ico,png,txt,html}',
            'images/*',
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
            'images/*',
            '.htaccess',
            '<%= app_files.json %>'
          ],
          dest: '<%= compile_dir %>/',
          cwd: '<%= app_dir %>',
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

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/scripts/**/*.js',
          '<%= build_dir %>/modules/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/styles/<%= css_name %>.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= compile_dir %>/scripts/<%= js_name %>.js',
          // '<%= vendor_files.css %>',
          '<%= compile_dir %>/styles/<%= css_name %>.css'
        ]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      app: [
        '<%= app_dir %>/<%= app_files.js %>'
      ],
      test: [
        '<%= app_dir %>/<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      globals: {}
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
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    },

    /**
     * Reads HTML for usemin blocks to enable smart builds that automatically
     * concat, minify and revision files. Creates configurations in memory so
     * additional tasks can operate on them
     */
    useminPrepare: {
      html: '<%= temp_dir %>/index.html',
      options: {
        dest: '<%= compile_dir %>'
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
        livereload: true
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
          '<%= app_dir %>/modules/**/*.js'
        ],
        tasks: [
          'jshint:app',
          'copy:build_app_files',
          'index:build',
          'karma:unit:run'
        ],
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: ['<%= app_dir %>/<%= app_files.html %>'],
        tasks: ['index:build']
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: ['<%= app_dir %>/<%= app_files.atpl %>'],
        tasks: [
          'html2js',
          'index:build',
        ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      less: {
        files: [
          '<%= app_dir %>/<%= app_files.less %>',
          '<%= app_dir %>/**/*.less'
        ],
        tasks: [
          'less:build',
          'index:build',
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
        noColor: false,
        args: {
          browser: 'chrome'
        }
      },
      squared: {
        options: {
          args: {
            specs: [
              'test/e2e-protractor/squared/*_spec.js'
            ]
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
  grunt.registerTask('serve', function(target) {
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

  grunt.registerTask('server', function() {
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
    'jshint',
    'less',
    'copy_build',
    'autoprefixer',
    'index:build',
    'karmaconfig',
    'karma:continuous'
  ]);

  // Build files into the dist folder for production
  grunt.registerTask('compile', [
    'clean:dist',
    'copy_compile',
    'ngAnnotate',
    'concat:compile_css',
    'concat:compile_js',
    'index:compile',
    'useminPrepare',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  // Copy the needed files into the build folder
  grunt.registerTask('copy_build', [
    'copy:build_app_files',
    'copy:build_vendor_css',
    'copy:build_vendor_fonts',
    'copy:build_vendor_images',
    'copy:build_vendorjs'
  ]);

  // Compile, concatenate, minify and copy app files for deployment
  grunt.registerTask('copy_compile', [
    'copy:compile_app_files',
    'copy:compile_fonts',
    'copy:compile_images',
    'copy:compile_bluepng'
  ]);

  grunt.registerTask('test-setup', function(target) {
    if (target === 'build') {
      return grunt.task.run([
        'clean',
        'build',
        'connect:test_build'
      ]);
    }
    grunt.task.run([
      'clean',
      'build',
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

  grunt.registerTask('test', function(target) {
    if (target === 'build') {
      return grunt.task.run([
        'test-setup:build',
        'protractor:squared',
        'protractor:huron',
        'protractor:hercules'
      ]);
    }
    grunt.task.run([
      'test-setup:dist',
      'protractor:squared',
      'protractor:huron',
      'protractor:hercules'
    ]);
  });

  // A utility function to get all app JavaScript sources.
  function filterForJS(files) {
    return files.filter(function(file) {
      return file.match(/\.js$/);
    });
  }

  // A utility function to get all app CSS sources.
  function filterForCSS(files) {
    return files.filter(function(file) {
      return file.match(/\.css$/);
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask('index', 'Process index.html template', function() {

    var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
    var jsFiles = filterForJS(this.filesSrc).map(function(file) {
      return file.replace(dirRE, '');
    });
    var cssFiles = filterForCSS(this.filesSrc).map(function(file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy('app/index.html', this.data.dir + '/index.html', {
      process: function(contents, path) {
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
  grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function() {
    var jsFiles = filterForJS(this.filesSrc);

    grunt.file.copy('karma.conf.js', grunt.config('test_dir') + '/karma-unit.js', {
      process: function(contents, path) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });
};
