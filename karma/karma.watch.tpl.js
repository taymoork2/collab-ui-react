module.exports = function (karma) {
  karma.set({
    /**
     * From where to look for files, starting with the location of this file.
     */
    basePath: '../',

    /**
     * This is the list of file patterns to load into the browser during testing.
     */
    files: [, {
      pattern: 'test/fixtures/**/*.json',
      watched: true,
      served: true,
      included: false
    }],

    exclude: [],

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine', 'sinon'],

    plugins: [
      'karma-jasmine',
      'karma-sinon',
      'karma-phantomjs-launcher'
    ],

    /**
     * On which port should the browser connect, on which port is the test runner
     * operating, and what is the URL path for the browser to use.
     */
    port: 9019,
    runnerPort: 9100,
    urlRoot: '/',
    colors: true,

    /**
     * Disable file watching by default.
     */
    autoWatch: false,

    /**
     * Test results reporter to use
     * possible values: 'dots', 'progress', 'coverage'
     */
    reporters: [
      'dots'
    ],

    /**
     * The list of browsers to launch to test on. This includes only "Firefox" by
     * default, but other browser names include:
     * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
     */
     browsers: [process.env.atlas_karma_browser || 'PhantomJS'],
  });
};
