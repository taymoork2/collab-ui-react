'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as squared team member admin user', function() {
  it('should login', function(){
    login.login(testuser.username, testuser.password);
  });
}); //State is logged-in

describe('Org Info flow', function() {
  beforeEach(function() {
    this.addMatchers({
      toBeLessThanOrEqualTo: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: actual < expected || actual === expected,
              message: 'Expected ' + actual + 'to be less than or equal to ' + expected
            };
          }
        };
      }
    });
  });
});

describe('Navigating to organization tab', function() {
	it('clicking on orgs tab should show the org info', function() {
		navigation.manageTab.click();
    expect(manage.displayName.isDisplayed()).toBeTruthy();
    expect(manage.estimatedSize.isDisplayed()).toBeTruthy();
    expect(manage.totalUsers.isDisplayed()).toBeTruthy();
    expect(manage.enableSSO.isDisplayed()).toBeTruthy();
    expect(manage.saveButton.isDisplayed()).toBeFalsy();
    expect(manage.refreshButton.isDisplayed()).toBeTruthy();
  });
});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    expect(navigation.settings.isDisplayed()).toBeTruthy();
    navigation.settings.click();
    expect(navigation.logoutButton.isDisplayed()).toBeTruthy();
    navigation.logoutButton.click();
  });
});

