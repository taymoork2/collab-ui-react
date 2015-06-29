'use strict';

describe('Partner user', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  it('should login', function () {
    login.login('partner-sales-user', '#/partner/customers');
  });

  it('should see customers tab', function () {
    utils.expectIsDisplayed(navigation.customersTab);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
