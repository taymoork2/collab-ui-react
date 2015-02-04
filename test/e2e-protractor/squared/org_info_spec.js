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

describe('Org Info flow', function() {
  it('should login as squared team member admin user', function(){
    login.login(testuser.username, testuser.password);
  });

  it('clicking on orgs tab should show the org info', function() {
    navigation.clickOrganization();
    expect(manage.displayName.isDisplayed()).toBeTruthy();
    expect(manage.estimatedSize.isDisplayed()).toBeTruthy();
    expect(manage.totalUsers.isDisplayed()).toBeTruthy();
    expect(manage.enableSSO.isDisplayed()).toBeTruthy();
    expect(manage.saveButton.isDisplayed()).toBeFalsy();
    expect(manage.refreshButton.isDisplayed()).toBeTruthy();
  });

  it('should log out', function() {
    navigation.logout();
  });
});
