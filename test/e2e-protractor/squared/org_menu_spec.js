'use strict';

describe('Organization Permissions check', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as a user with organization creation permissions', function () {
    login.login('pbr-admin');
  });

  it('should verify that the organization creation link is visible', function () {
    navigation.clickDevelopmentTab();
    utils.expectIsDisplayed(navigation.orgAddTab);
  });

  it('should log out', function () {
    navigation.logout();
  });

  it('should login as a user without organization creation permissions', function () {
    login.login('sqtest-admin');
  });

  it('should verify that the organization creation link is not visible', function () {
    navigation.clickDevelopmentTab();
    utils.expectIsNotDisplayed(navigation.orgAddTab);
  });
});
