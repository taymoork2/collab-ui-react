'use strict';

describe('Partner user', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login', function () {
    login.login('partner-sales-user', '#/partner/customers');
  });

  it('should see customers tab', function () {
    utils.expectIsDisplayed(navigation.customersTab);
  });
});
