'use strict';

/* global describe */
/* global expect */
/* global partner */
/* global navigation */
/* global utils */
/* global login */
/* global notifications */
/* global deleteTrialUtils */

describe('Partner flow', function () {
  var orgId;
  var accessToken;

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function () {

    it('should login', function () {
      login.login('partner-admin', '#/partner/overview');
    });

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
    });

    it('should have a partner token', function (done) {
      utils.retrieveToken().then(function (token) {
        accessToken = token;
        done();
      });
    });

    it('should display trials list', function () {
      utils.expectIsDisplayed(partner.trialsPanel);
      utils.expectIsDisplayed(partner.viewAllLink);
    });
  }); //State is logged-in

  describe('Add Partner Trial', function () {

    it('should view all trials', function () {
      navigation.clickCustomers();
    });

    it('should add a new trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.expectIsDisplayed(partner.squaredTrialCheckbox);
      utils.expectIsNotDisplayed(partner.squaredUCTrialCheckbox);

      utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);
      utils.click(partner.squaredTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');
    }, 60000);

    it('should find new trial', function (done) {
      utils.expectIsDisplayed(partner.newTrialRow);

      partner.retrieveOrgId().then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    });

    it('should edit an exisiting trial', function () {
      utils.click(partner.newTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editLink);

      utils.expectIsDisplayed(partner.editTrialForm);

      utils.expectAttribute(partner.squaredTrialCheckbox, 'disabled', 'true');
      utils.click(partner.saveUpdateButton);

      notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');

      utils.expectIsDisplayed(partner.newTrialRow);
    }, 60000);

  });

  describe('Partner launches customer portal', function () {

    it('Launch customer portal via preview panel and display first time wizard', function () {
      var appWindow = browser.getWindowHandle();

      utils.click(partner.newTrialRow);
      utils.click(partner.launchCustomerPanelButton);

      browser.getAllWindowHandles().then(function (handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);

        utils.expectIsDisplayed(wizard.wizard);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);
        utils.click(wizard.finishTab);

        utils.expectText(wizard.mainviewTitle, 'Get Started');
        utils.expectIsDisplayed(wizard.mainviewTitle);
        utils.click(wizard.finishBtn);
        navigation.expectDriverCurrentUrl('overview');
        utils.expectIsDisplayed(navigation.tabs);

        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('Launch customer portal via dropdown and display partner managing org in partner filter', function () {
      var appWindow = browser.getWindowHandle();

      utils.click(partner.exitPreviewButton);
      utils.expectIsNotDisplayed(partner.previewPanel);

      utils.click(partner.actionsButton);
      utils.click(partner.launchCustomerButton);

      browser.getAllWindowHandles().then(function (handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        utils.expectIsDisplayed(navigation.tabs);

        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

  });

  describe('Partner launches its orgs portal', function () {

    it('should launch partners org view', function () {
      var appWindow = browser.getWindowHandle();

      utils.expectIsDisplayed(navigation.userInfoButton);
      navigation.launchPartnerOrgPortal();

      browser.getAllWindowHandles().then(function (handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('true');
        utils.expectIsDisplayed(navigation.tabs);

        navigation.expectDriverCurrentUrl('overview');
        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

  });

  describe('Partner landing page reports', function () {

    it('should delete an exisiting org thus deleting trial', function () {
      deleteTrialUtils.deleteOrg(orgId, accessToken);
    });

    it('should show the reports', function () {
      navigation.clickHome();
      utils.expectIsDisplayed(partner.entitlementsChart);
      utils.expectIsDisplayed(partner.entitlementsCount);
    });

    it('should show active users chart', function () {
      utils.click(partner.activeUsersTab);
      utils.expectIsDisplayed(partner.activeUsersChart);
      utils.expectIsDisplayed(partner.activeUsersCount);
    });

    it('should show average calls chart', function () {
      utils.click(partner.averageCallsTab);
      utils.expectIsDisplayed(partner.averageCallsChart);
      utils.expectIsDisplayed(partner.averageCallsCount);
    });

    it('should show content shared chart', function () {
      utils.click(partner.contentSharedTab);
      utils.expectIsDisplayed(partner.contentSharedChart);
      utils.expectIsDisplayed(partner.contentSharedCount);
    });
  });

  describe('Reports Page', function () {

    it('should load cached values into directive when switching tabs', function () {
      navigation.clickReports();
      utils.expectIsDisplayed(reports.refreshData);
      utils.expectIsDisplayed(reports.reloadedTime);
      utils.expectIsDisplayed(reports.calls);
      utils.expectIsDisplayed(reports.conversations);
      utils.expectIsDisplayed(reports.activeUsers);
      utils.expectIsDisplayed(reports.convOneOnOne);
      utils.expectIsDisplayed(reports.convGroup);
      utils.expectIsDisplayed(reports.calls);
      utils.expectIsDisplayed(reports.callsAvgDuration);
      utils.expectIsDisplayed(reports.contentShared);
      utils.expectIsDisplayed(reports.contentShareSizes);
    });
  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
