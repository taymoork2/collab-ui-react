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
  searchStr: 'fake'
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as non-sso admin user', function() {
  it('should login', function(){
    login.login(testuser.username, testuser.password);
  });
}); //State is logged-in

describe('Org Entitlement flow', function() {
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

describe('Navigating to users tab', function() {
	it('clicking on users tab should change the view', function() {
    navigation.clickUsers();
  });
});

describe('clicking a user', function() {
  it('should display conversations panel', function() {
    users.search(testuser.searchStr, 20);
    expect(users.resultUsername.getText()).toContain(testuser.searchStr);
    users.resultUsername.click();
    expect(users.squaredPanel.isDisplayed()).toBeTruthy();
    expect(users.huronPanel.isDisplayed()).toBeFalsy();
    expect(users.conferencePanel.isDisplayed()).toBeFalsy();
    expect(users.endpointPanel.isDisplayed()).toBeFalsy();
  });
});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    navigation.logout();
  });
});

