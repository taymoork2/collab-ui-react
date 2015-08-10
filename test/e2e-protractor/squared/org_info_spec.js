'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

describe('Org Info flow', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as squared team member admin user', function () {
    login.login('pbr-admin', '#/organization');
  });

  it('clicking on orgs tab should show the org info', function () {
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
