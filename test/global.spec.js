'use-strict';

describe('Global Unit Test Config', function () {
	// NOTE: fixturesPath is a singleton.  Changing this path changes it 
	// for all tests!  Please know what you are doing before changing.
  jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';
});