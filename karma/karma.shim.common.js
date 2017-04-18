// Bootstrap the app
require('../app/bootstrap.dependencies');
require('angular-mocks');

// Test Dependencies
require('jasmine-jquery');
require('sinon');
require('karma-sinon');
require('jasmine-sinon');
require('jasmine-promise-matchers/dist/jasmine-promise-matchers.js');
require('bardjs/dist/bard.js');

// Initial test setup
require('../test/global.spec.js');
