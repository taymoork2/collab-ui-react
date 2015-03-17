'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

describe('Org Info flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  it('should login as squared team member admin user', function () {
    login.login('pbr-admin');
  });

  it('clicking on orgs tab should show the org info', function () {
    navigation.clickOrganization();
    utils.expectIsDisplayed(manage.displayName);
    utils.expectIsDisplayed(manage.estimatedSize);
    utils.expectIsDisplayed(manage.totalUsers);
    utils.expectIsDisplayed(manage.enableSSO);
    utils.expectIsNotDisplayed(manage.saveButton);
    utils.expectIsDisplayed(manage.refreshButton);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
