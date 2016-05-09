'use strict';

/* global deleteTrialUtils */
/* global LONG_TIMEOUT */

describe('Partner flow', function () {
  var orgId;
  var accessToken;
  var appWindow;

  describe('Login as partner admin user', function () {

    it('should login', function () {
      login.login('partner-admin', '#/partner/overview').then(function (token) {
        accessToken = token;
      });
    });

    it('should display correct navigation colors', function () {
      utils.expectClass(navigation.body, 'inverse');
    });

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.reportsTab);
    });

    it('should display trials list', function () {
      utils.expectIsDisplayed(partner.trialsPanel);
      utils.expectIsDisplayed(partner.viewAllLink);
    });

    it('should display partner support page', function () {
      utils.click(navigation.userInfoButton);
      utils.click(navigation.supportLink).then(navigation.launchSupportPage);
    });
  });

  describe('Add Partner Trial', function () {

    it('should view all trials', function () {
      navigation.clickCustomers();
    });

    describe('New Trial box', function () {

      beforeEach(function () {
        utils.click(partner.addButton);
        utils.expectIsDisplayed(partner.addTrialForm);
      });

      afterEach(function () {
        utils.click(partner.cancelTrialButton);
      });
    });

    it('should add a new trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      utils.expectIsDisabled(partner.startTrialButton);

      utils.expectIsDisplayed(partner.messageTrialCheckbox);
      utils.expectIsNotDisplayed(partner.squaredUCTrialCheckbox);

      utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');
      utils.clickEscape();
    });

    it('should find new trial', function (done) {
      utils.click(partner.trialFilter);
      utils.sendKeys(partner.searchFilter, partner.newTrial.customerName + protractor.Key.ENTER );
      utils.expectIsDisplayed(partner.newTrialRow);

      partner.retrieveOrgId(partner.newTrialRow).then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    }, LONG_TIMEOUT);

    xit('should edit an exisiting trial', function () {
      utils.click(partner.newTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.termsActionButton);
      utils.click(partner.editTermsButton);

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.editTrialForm);
        utils.expectClass(partner.messageTrialCheckbox, 'disabled');

        utils.expectIsDisabled(partner.saveUpdateButton);
        utils.clear(partner.licenseCountInput);
        utils.sendKeys(partner.licenseCountInput, partner.editTrial.licenseCount);
        utils.click(partner.saveUpdateButton);
        notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');
        utils.click(partner.trialFilter);
        utils.expectIsDisplayed(partner.newTrialRow);
      });
    }, LONG_TIMEOUT);

  });

  describe('Partner launches customer portal', function () {

    it('Launch customer portal via preview panel and display first time wizard', function () {
      appWindow = browser.getWindowHandle();

      utils.click(partner.newTrialRow);
      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectIsEnabled(partner.launchCustomerPanelButton);
      utils.click(partner.launchCustomerPanelButton);
      utils.switchToNewWindow().then(function () {

        // backend services are slow to check userauthinfo/accounts
        utils.wait(wizard.wizard, LONG_TIMEOUT);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);
      });
    }, LONG_TIMEOUT);

    it('should navigate first time wizard', function () {
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
      utils.click(wizard.beginBtn);
      utils.click(wizard.saveBtn);

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
      utils.click(wizard.nextBtn);
      utils.click(wizard.nextBtn);

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
      utils.click(wizard.nextBtn);
      utils.click(wizard.finishBtn);
      notifications.clearNotifications();

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Get Started');
      utils.click(wizard.finishBtn);

      navigation.expectDriverCurrentUrl('overview');
      utils.expectIsDisplayed(navigation.tabs);

      browser.close();
      browser.switchTo().window(appWindow);
    }, LONG_TIMEOUT);

    it('Launch customer portal via dropdown and display partner managing org in partner filter', function () {
      appWindow = browser.getWindowHandle();

      utils.click(partner.exitPreviewButton);

      utils.click(partner.actionsButton);
      utils.expectIsDisplayed(partner.launchCustomerButton);
      utils.click(partner.launchCustomerButton);
      utils.switchToNewWindow().then(function () {

        // backend services are slow to check userauthinfo/accounts
        utils.wait(navigation.tabs, LONG_TIMEOUT);
        utils.expectIsDisplayed(navigation.tabs);
      });
    });

    it('Should close customer portal', function () {
      browser.close();
      browser.switchTo().window(appWindow);
      browser.refresh();
    });

  }, LONG_TIMEOUT);

  afterAll(function () {
    deleteTrialUtils.deleteOrg(orgId, accessToken);
  });

  describe('Partner launches its orgs portal', function () {

    it('should launch partners org view', function () {
      appWindow = browser.getWindowHandle();

      utils.expectIsDisplayed(navigation.userInfoButton);
      utils.click(partner.allFilter);
      utils.click(partner.myOrganization);
      utils.click(partner.launchButton);

      utils.switchToNewWindow().then(function () {

        navigation.expectDriverCurrentUrl('overview');
        // backend services are slow to check userauthinfo/accounts
        utils.wait(navigation.tabs, LONG_TIMEOUT);
        utils.expectIsDisplayed(navigation.tabs);

        browser.close();
        browser.switchTo().window(appWindow);

      });
    }, LONG_TIMEOUT);
  });

  describe('Partner landing page reports', function () {
    it('should show the reports', function () {
      navigation.clickHome();
      utils.expectIsDisplayed(partner.entitlementsChart);
      utils.expectIsDisplayed(partner.entitlementsCount);
    });
  });
});
