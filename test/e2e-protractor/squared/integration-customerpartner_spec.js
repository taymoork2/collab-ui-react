'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */

describe('CS Admin flow', function () {
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

    it('clicking on admin customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.adminCustomerOrgId);
      utils.expectIsEnabled(partner.launchCustomerPanelButton);
    });

    it('clicking on regular customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.customerNameHeader);
      utils.click(partner.regularCustomerOrgId);
      utils.expectIsDisabled(partner.launchCustomerPanelButton);
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});

describe('CS User flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

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

    it('clicking on admin customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.adminCustomerOrgId);
      utils.expectIsDisabled(partner.launchCustomerPanelButton);
    });

    it('clicking on regular customer should enable/disable ability to launch appropriately', function () {
      utils.click(partner.customerNameHeader);
      utils.click(partner.regularCustomerOrgId);
      utils.expectIsEnabled(partner.launchCustomerPanelButton);
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('CS Regular User with no managed orgs flow', function () {

    beforeEach(function () {
      browser.ignoreSynchronization = true;
    });

    afterEach(function () {
      browser.ignoreSynchronization = false;
    });

    it('should show Unauthorized page after login', function () {
      login.loginUnauthorized('customer-regular-user');
    });

    it('should log out', function () {
      navigation.logout();
    });

  });

});
