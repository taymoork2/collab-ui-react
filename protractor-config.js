exports.config = {
  // Spec patterns are relative to the location of this config.
  specs: [
    'test/e2e-protractor/*_spec.js'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {'args': ['--disable-extensions']}
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:9001',

  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: true,
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 50000
  }
};
