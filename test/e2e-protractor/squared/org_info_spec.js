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
  beforeEach(function() { browser.ignoreSynchronization = true; });
  afterEach(function() { browser.ignoreSynchronization = false; });

  it('should login as squared team member admin user', function(){
    login.login(testuser.username, testuser.password);
  });

  it('clicking on orgs tab should show the org info', function() {
    navigation.clickOrganization();
    utils.expectIsDisplayed(manage.displayName);
    utils.expectIsDisplayed(manage.estimatedSize);
    utils.expectIsDisplayed(manage.totalUsers);
    utils.expectIsDisplayed(manage.enableSSO);
    utils.expectIsNotDisplayed(manage.saveButton);
    utils.expectIsDisplayed(manage.refreshButton);
  });

  it('should log out', function() {
    navigation.logout();
  });
});
