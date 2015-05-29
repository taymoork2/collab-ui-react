'use strict';

/* global describe */
/* global expect */
/* global partner */
/* global navigation */
/* global utils */
/* global login */
/* global notifications */
/* global deleteTrialUtils */

xdescribe('Spark UC Partner flow', function () {
  var orgId;
  var accessToken;

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function () {

    it('should login', function () {
      login.login('partner-squc-admin', '#/partner/overview');
    });

    it('should have a partner token', function (done) {
      utils.retrieveToken().then(function (token) {
        accessToken = token;
        done();
      });
    });

    it('should display trials list', function () {
      utils.expectIsDisplayed(partner.trialsPanel);
    });
  }); //State is logged-in

  describe('Add Partner Trial', function () {

    it('should view all trials', function () {
      navigation.clickCustomers();
      utils.expectIsDisplayed(partner.customerList);
      utils.click(partner.trialFilter);
    });

    it('should add a new trial', function () {
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.expectIsDisplayed(partner.squaredTrialCheckbox);
      utils.expectIsDisplayed(partner.squaredUCTrialCheckbox);

      utils.sendKeys(partner.customerNameInput, partner.newSqUCTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newSqUCTrial.customerEmail);
      utils.click(partner.squaredTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newSqUCTrial.customerName, 'A trial was successfully started');
    }, 60000);

    it('should find new trial', function (done) {
      utils.click(partner.trialFilter);
      utils.expectIsDisplayed(partner.newSqUCTrialRow);

      partner.retrieveOrgId(partner.newSqUCTrialRow).then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    });

    it('should edit trial with uc entitlements and add one did', function () {
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editLink);

      utils.expectIsDisplayed(partner.editTrialForm);

      utils.expectClass(partner.squaredTrialCheckbox, 'disabled');
      utils.click(partner.squaredUCTrialCheckbox);

      utils.click(partner.saveUpdateButton);

      utils.sendKeys(partner.customerDidInput, partner.dids.one);
      utils.sendKeys(partner.customerDidInput, protractor.Key.ENTER);

      utils.click(partner.startTrialWithSqUCButton);

      notifications.assertSuccess(partner.newSqUCTrial.customerName, 'You have successfully edited a trial for');
    }, 60000);

    it('should add new did to the trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToBeSet(partner.customerDidAddInput, '+' + partner.dids.one);

      utils.sendKeys(partner.customerDidInput, partner.dids.two);
      utils.sendKeys(partner.customerDidInput, protractor.Key.ENTER);
      utils.click(partner.addDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectTextToBeSet(partner.didNumberSpan, '2');
    });

    it('should delete extra did from the trial', function () {
      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToContain(partner.customerDidAddInput, '+' + partner.dids.one);
      utils.expectValueToContain(partner.customerDidAddInput, '+' + partner.dids.two);

      utils.click(partner.getDidTokenClose(partner.dids.two));

      utils.click(partner.addDidButton);
      utils.expectIsDisplayed(partner.removeDidPanel);
      utils.click(partner.removeDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectTextToBeSet(partner.didNumberSpan, '1');

      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToBeSet(partner.customerDidAddInput, '+' + partner.dids.one);
      utils.click(partner.addDidDismissButton);
    });
  });

  it('should delete an exisiting org thus deleting trial', function () {
    deleteTrialUtils.deleteOrg(orgId, accessToken);
    deleteUtils.deleteSquaredUCCustomer(orgId, accessToken);
  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
