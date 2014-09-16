'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-test-admin@squared2webex.com',
  password: 'C1sc0123!',
};

var testuser2 = {
  username: 'pbr-test-user@squared2webex.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as squared team member admin user', function() {
  it('should login', function(){
    login.login(testuser.username, testuser.password);
  });
}); //State is logged-in

describe('Check squared team member entitlements', function() {
  it('clicking on users tab should change the view', function() {
    navigation.clickUsers();
  });

  it('click on add button should show entitlements the admin can use', function () {
    users.addUsers.click();
    expect(users.listPanel.isDisplayed()).toBeFalsy();
    expect(users.managePanel.isDisplayed()).toBeTruthy();

    users.assertEntitlementListSize(8);
    expect(users.manageSquaredTeamMember.isDisplayed()).toBeTruthy();
  });

});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    navigation.logout();
  });
});

// Logging in. Write your tests after the login flow is complete.
describe('Login as non squared team member admin user', function() {
  it('should login', function(){
    login.login(testuser2.username, testuser2.password);
  });
}); //State is logged-in

describe('Check non squared team member entitlements', function() {
  it('clicking on users tab should change the view', function() {
    navigation.clickUsers();
  });

  it('click on add button should show entitlements the admin can use', function () {
    users.addUsers.click();
    expect(users.listPanel.isDisplayed()).toBeFalsy();
    expect(users.managePanel.isDisplayed()).toBeTruthy();

    users.assertEntitlementListSize(7);
    expect(users.manageSquaredTeamMember.isPresent()).toBeFalsy();
  });

});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    navigation.logout();
  });
});

