'use strict';

/* global LONG_TIMEOUT */

describe('Launch customer as a sales admin', function () {
  it('should login as a partner sales account admin', function () {
    login.login('partner-reports-sales-admin', '#/partner/customers');
  });

  describe('Launch customer ', function () {
    it('should launch customer', function () {
      customers.clickViewCustomer('Atlas_Test_Sales_Admin_Org_Create');
      utils.click(customers.viewCustomer);
      utils.switchToNewWindow().then(function () {
        utils.expectIsDisplayed(landing.overviewPage);
      });
    });
  });
});
