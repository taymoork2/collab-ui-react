'use strict';

var featureToggle = require('../utils/featureToggle.utils');

/* global LONG_TIMEOUT */

describe('WebEx Trial Creation', function () {

  var WEBEX_SITE_ACTIVATION_TIMEOUT = 50 * 60000;

  it('should login', function () {
    login.login('partner-admin', '#/partner/customers');
  });

  it('should confirm WebEx URL validator is working by entering URL that is already in use', function () {
    utils.click(partner.addButton);

    utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
    utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);
    utils.setCheckboxIfDisplayed(partner.squaredUCTrialCheckbox, false, 1000);
    utils.setCheckboxIfDisplayed(partner.careTrialCheckbox, false, 100);
    utils.setCheckboxIfDisplayed(partner.roomSystemsTrialCheckbox, false, 100);
    utils.setCheckboxIfDisplayed(partner.sparkBoardTrialCheckbox, false, 100);
    utils.click(partner.startTrialButton);

    // send in well know in-use URL
    utils.sendKeys(partner.webexSiteURL, 'cisco.webex.com' + protractor.Key.ENTER);
    utils.waitClass(partner.webexSiteURL, 'ng-invalid-site-url');
    utils.clear(partner.webexSiteURL);
  });

  it('should confirm WebEx URL validator allows unique URL', function () {
    utils.sendKeys(partner.webexSiteURL, partner.newTrial.webexSiteURL + protractor.Key.ENTER);
    utils.waitClass(partner.webexSiteURL, 'ng-valid-site-url');
  });

  it('should create WebEx partner trial', function () {
    // select PST timezone
    utils.selectDropdown('.trial-modal', 'San Francisco');
    utils.click(partner.startTrialButton);
    notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');
    utils.clickEscape();
  });

  it('should find new trial', function () {
    utils.search(partner.newTrial.customerName, -1);
    utils.waitIsDisplayed(partner.newTrialRow);
    partner.retrieveOrgId(partner.newTrialRow);
  }, LONG_TIMEOUT);

  it('should confirm trial created (long wait)', function () {
    utils.click(partner.newTrialRow);
    utils.waitIsDisplayed(partner.previewPanel);
    utils.click(partner.openMeetingSidePanelLink);
    utils.waitIsDisplayed(partner.trialPending);
    expect(partner.expectTrialNotPending()).toBeTruthy();
  }, WEBEX_SITE_ACTIVATION_TIMEOUT);

  describe('Partner launches customer portal', function () {
    var appWindow;

    it('should launch customer portal via preview panel and display first time wizard', function () {
      appWindow = browser.getWindowHandle();
      utils.click(partner.exitPreviewButton);
      utils.search(partner.newTrial.customerName, -1);
      utils.click(partner.newTrialRow);

      utils.expectIsEnabled(partner.launchCustomerPanelButton);
      utils.click(partner.launchCustomerPanelButton);
      utils.switchToNewWindow().then(function () {

        // backend services are slow to check userauthinfo/accounts
        utils.wait(wizard.wizard, LONG_TIMEOUT);
        utils.waitIsDisplayed(wizard.leftNav);
        utils.waitIsDisplayed(wizard.mainView);
      });
    }, LONG_TIMEOUT);

    it('should navigate first time wizard', function () {
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
      utils.click(wizard.beginBtn);

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Message Settings');
      utils.click(wizard.saveBtn);

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
      utils.expectTextToBeSet(wizard.sipURLExample, 'These subdomains will be reserved for you:');
      utils.sendKeys(wizard.sipDomain, partner.newTrial.sipDomain + protractor.Key.ENTER);
      utils.click(wizard.saveCheckbox);

      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // click "Save" instead of "Next" because there are no SSO steps
        // goes to last tab because there is no Add Users
        utils.click(wizard.saveBtn);
        notifications.assertSuccess('The Spark SIP Address has been successfully saved');
      } else {
        // TODO remove when feature toggle is removed
        utils.click(wizard.nextBtn);
        notifications.assertSuccess('The Spark SIP Address has been successfully saved');

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
        utils.click(wizard.nextBtn);

        utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
        utils.click(wizard.skipBtn);
      }

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Get Started');
      utils.click(wizard.finishBtn);

      navigation.expectDriverCurrentUrl('overview');
      utils.waitIsDisplayed(navigation.tabs);
    }, LONG_TIMEOUT);

    it('should open trial via services tab', function () {
      navigation.clickServicesTab();
      utils.click(partner.getMeetingLink(partner.newTrial.sipDomain));
      utils.expectTextToBeSet(partner.pageHeaderTitle, 'WebEx Sites');

      utils.click(partner.getTrialConfigBtn(partner.newTrial.webexSiteURL));
      utils.expectTextToBeSet(partner.pageHeaderTitle, 'Configure WebEx Site');
    });

    it('should close browser window', function () {
      browser.close();
      browser.switchTo().window(appWindow);
    });
  });

  it('should click the Delete Customer button', function () {
    utils.scrollIntoView(partner.deleteCustomerButton);
    utils.click(partner.deleteCustomerButton);
    utils.waitForModal().then(function () {
      utils.click(partner.deleteCustomerOrgConfirm).then(function () {
        notifications.assertSuccess(partner.newTrial.customerName, 'successfully deleted');
      });
    });
  });
});
