'use strict';

xdescribe('CS Admin flow', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should just login', function () {
    login.login('customer-support-admin', '#/partner/customers');
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.usersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
    });

    it('customer page should not have add button', function () {
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
    });

    xit('clicking on admin customer should enable/disable ability to launch appropriately', function () {
      utils.wait(partner.adminCustomerOrgId, 75000);
      utils.click(partner.adminCustomerOrgId);
      utils.waitUntilEnabled(partner.launchCustomerPanelButton);
    }, 80000); // managedOrgs API performance is terrible

    xit('clicking on regular customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.exitPreviewButton);
      utils.click(partner.customerNameHeader);
      utils.click(partner.regularCustomerOrgId);
      utils.waitUntilDisabled(partner.launchCustomerPanelButton);
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});

xdescribe('CS User flow', function () {

  it('should just login', function () {
    login.login('customer-support-user', '#/partner/customers');
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsNotDisplayed(navigation.reportsTab);
      utils.expectIsNotDisplayed(navigation.supportTab);
    });

    it('customer page should not have add button', function () {
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
    });

    xit('clicking on admin customer should enable/disable ability to launch appropriately', function () {
      utils.wait(partner.adminCustomerOrgId, 75000);
      utils.click(partner.adminCustomerOrgId);
      utils.waitUntilDisabled(partner.launchCustomerPanelButton);
    }, 80000); // managedOrgs API performance is terrible

    xit('clicking on regular customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.exitPreviewButton);
      utils.click(partner.customerNameHeader);
      utils.click(partner.regularCustomerOrgId);
      utils.waitUntilEnabled(partner.launchCustomerPanelButton);
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('CS Regular User with no managed orgs flow', function () {
    it('should show Unauthorized page after login', function () {
      login.loginUnauthorized('customer-regular-user');
    });
  });

});
