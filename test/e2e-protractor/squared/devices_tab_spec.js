'use strict';

describe('Devices tab check', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as a partner admin', function () {
    login.login('partner-admin', '#/partner/overview');
  });

  it('should not see the devices tab', function () {
    utils.expectIsNotDisplayed(navigation.devicesTab);
  });

  it('should log out', function () {
    navigation.logout();
  });

  it('should login as a customer', function () {
    login.login('pbr-admin');
  });

  it('should see the devices tab', function () {
    utils.expectIsDisplayed(navigation.devicesTab);
  });
});
