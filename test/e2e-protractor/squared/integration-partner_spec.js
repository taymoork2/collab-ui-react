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

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function () {

    it('should login', function () {
      login.login('partner-admin', '#/partner/overview');
    });

    it('should display correct navigation colors', function () {
      utils.expectClass(navigation.body, 'inverse');
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
      utils.click(partner.trialFilter);
      utils.expectIsDisplayed(partner.newTrialRow);

      partner.retrieveOrgId(partner.newTrialRow).then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    });

    it('should edit an exisiting trial', function () {
      utils.click(partner.newTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.termsActionButton);
      utils.click(partner.editTermsButton);

      utils.expectClass(partner.squaredTrialCheckbox, 'disabled');

      utils.click(partner.saveUpdateButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');

      utils.click(partner.trialFilter);
      utils.expectIsDisplayed(partner.newTrialRow);
    }, 60000);

  });

  describe('Partner launches customer portal', function () {

    it('Launch customer portal via preview panel and display first time wizard', function () {
      var appWindow = browser.getWindowHandle();

      utils.click(partner.newTrialRow);
      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectIsEnabled(partner.launchCustomerPanelButton);
      utils.click(partner.launchCustomerPanelButton);
      utils.switchToNewWindow().then(function () {

        utils.expectIsDisplayed(wizard.wizard);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
        utils.click(wizard.beginBtn);
        utils.click(wizard.saveBtn);

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
        utils.click(wizard.nextBtn);

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');
        utils.click(wizard.nextBtn);
        utils.click(wizard.finishBtn);
        notifications.clearNotifications();

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Get Started');
        utils.click(wizard.finishBtn);

        navigation.expectDriverCurrentUrl('overview');
        utils.expectIsDisplayed(navigation.tabs);

        browser.close();
        browser.switchTo().window(appWindow);

      });
    });

    it('Launch customer portal via dropdown and display partner managing org in partner filter', function () {
      var appWindow = browser.getWindowHandle();

      utils.click(partner.exitPreviewButton);

      utils.click(partner.actionsButton);
      utils.expectIsDisplayed(partner.launchCustomerButton);
      utils.click(partner.launchCustomerButton);
      utils.switchToNewWindow().then(function () {

        utils.expectIsDisplayed(navigation.tabs);

        browser.close();
        browser.switchTo().window(appWindow);

      });
    });

  });

  it('should delete an exisiting org thus deleting trial', function () {
    deleteTrialUtils.deleteOrg(orgId, accessToken);
  });

  describe('Partner launches its orgs portal', function () {

    it('should launch partners org view', function () {
      var appWindow = browser.getWindowHandle();

      utils.expectIsDisplayed(navigation.userInfoButton);
      navigation.launchPartnerOrgPortal();

      utils.switchToNewWindow().then(function () {

        navigation.expectDriverCurrentUrl('true');
        utils.expectIsDisplayed(navigation.tabs);

        navigation.expectDriverCurrentUrl('overview');

        browser.close();
        browser.switchTo().window(appWindow);

      });
    });

  });

  describe('Partner landing page reports', function () {

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
});
