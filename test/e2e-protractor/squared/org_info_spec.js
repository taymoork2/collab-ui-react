'use strict';

describe('Org Info flow', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as squared team member admin user', function () {
    login.login('pbr-admin', '#/organizations');
  });

  it('clicking on orgs tab should show the org info', function () {
    // TODO: these tests need to be re-written
    // utils.expectIsDisplayed(manage.displayName);
    // utils.expectIsDisplayed(manage.estimatedSize);
    // utils.expectIsDisplayed(manage.totalUsers);
    // utils.expectIsDisplayed(manage.enableSSO);
    // utils.expectIsNotDisplayed(manage.saveButton);
    // utils.expectIsDisplayed(manage.refreshButton);
  });
});
