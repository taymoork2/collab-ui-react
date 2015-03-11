'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */

var csadmin = {
  username: 'admin@csreptestdom.collaborate.com',
  password: 'C1sc0123!'
};

var csuser = {
  username: 'regUser1@csreptestdom.collaborate.com',
  password: 'P@ssword123',
};

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('CS Admin flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should just login', function () {
    login.login(csadmin.username, csadmin.password);
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      expect(navigation.getTabCount()).toBe(6);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.customersTab.isDisplayed()).toBeTruthy();
      expect(navigation.usersTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
    });

    it('clicking on customers tab should change the view', function () {
      navigation.clickCustomers();
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
      utils.expectIsDisplayed(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.regularCustomerOrgId);
    });

    it('clicking on customers should enable/disable ability to launch appropriately', function () {
      utils.click(partner.adminCustomerOrgId);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeTruthy();
      utils.click(partner.regularCustomerOrgId);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeFalsy();
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
    login.login(csuser.username, csuser.password);
  });

  // Navigation bar
  describe('Navigation Bar', function () {

    it('should display correct tabs for user based on role', function () {
      expect(navigation.getTabCount()).toBe(4);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.customersTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
    });

    it('clicking on customers tab should change the view', function () {
      navigation.clickCustomers();
      utils.expectIsDisplayed(partner.customerList);
      utils.expectIsNotDisplayed(partner.addButton);
      utils.expectIsDisplayed(partner.adminCustomerOrgId);
      utils.expectIsDisplayed(partner.regularCustomerOrgId);
    });

    it('clicking on customers should enable/disable ability to launch appropriately', function () {
      utils.click(partner.regularCustomerOrgId);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeTruthy();
      utils.click(partner.adminCustomerOrgId);
      expect(partner.launchCustomerPanelButton.isEnabled()).toBeFalsy();
    });

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});
