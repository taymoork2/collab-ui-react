'use strict';

/* global describe */
/* global expect */
/* global partner */
/* global navigation */
/* global utils */
/* global login */
/* global notifications */
/* global deleteTrialUtils */

//TODO reenable after pstn change
xdescribe('Spark UC Partner flow', function () {
  var orgId;
  var accessToken;

  beforeAll(function (done) {
    login.login('partner-squc-admin', '#/partner/customers');
    utils.retrieveToken().then(function (token) {
      accessToken = token;
      done();
    });
  }, 120000);

  describe('Add Partner Trial', function () {

    it('should add a new trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.squaredTrialCheckbox);
        utils.expectIsDisplayed(partner.squaredUCTrialCheckbox);

        utils.sendKeys(partner.customerNameInput, partner.newSqUCTrial.customerName);
        utils.sendKeys(partner.customerEmailInput, partner.newSqUCTrial.customerEmail);
        utils.click(partner.squaredTrialCheckbox);

        utils.click(partner.startTrialButton);
        notifications.assertSuccess(partner.newSqUCTrial.customerName, 'A trial was successfully started');
      });
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
      utils.click(partner.termsActionButton);
      utils.click(partner.editTermsButton);

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.editTrialForm);

        utils.expectClass(partner.squaredTrialCheckbox, 'disabled');
        utils.click(partner.squaredUCTrialCheckbox);

        utils.click(partner.saveUpdateButton);

        utils.sendKeys(partner.customerDidInput, partner.dids.one);
        utils.sendKeys(partner.customerDidInput, protractor.Key.ENTER);

        utils.click(partner.startTrialWithSqUCButton);

        notifications.assertSuccess(partner.newSqUCTrial.customerName, 'You have successfully edited a trial for');
      });
    }, 60000);

    it('should add two new did to the trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.communicationPhoneNumbers);
      utils.click(partner.phoneNumbersActionButton);
      utils.click(partner.addNumbersButton);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectTokenInput(partner.customerDidAdd, '+' + partner.dids.one);

      utils.sendKeys(partner.customerDidInput, partner.dids.two);
      utils.sendKeys(partner.customerDidInput, protractor.Key.ENTER);
      utils.sendKeys(partner.customerDidInput, partner.dids.three);
      utils.sendKeys(partner.customerDidInput, protractor.Key.ENTER);
      utils.click(partner.addDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.trialFilter);
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectTextToBeSet(partner.communicationPhoneNumbersCount, '3');
    });

    it('should delete second did from the trial', function () {
      utils.click(partner.communicationPhoneNumbers);
      utils.expectTextToBeSet(partner.phoneNumbersCount, '3 Numbers');
      utils.click(partner.phoneNumbersActionButton);
      utils.click(partner.addNumbersButton);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectTokenInput(partner.customerDidAdd, '+' + partner.dids.one);
      utils.expectTokenInput(partner.customerDidAdd, '+' + partner.dids.two);
      utils.expectTokenInput(partner.customerDidAdd, '+' + partner.dids.three);

      utils.click(partner.getDidTokenClose(partner.dids.two));

      utils.click(partner.addDidButton);
      utils.expectIsDisplayed(partner.removeDidPanel);
      utils.click(partner.removeDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.trialFilter);
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectTextToBeSet(partner.communicationPhoneNumbersCount, '2');
    });

    it('should delete third did from manage numbers list', function () {
      utils.click(partner.communicationPhoneNumbers);
      utils.expectIsDisplayed(partner.phoneNumbersSection);
      utils.expectTextToBeSet(partner.phoneNumbersCount, '2 Numbers');
      partner.clickPhoneNumberDelete(partner.dids.three);
      utils.expectIsDisplayed(partner.deleteNumberModal);
      utils.click(partner.deleteNumberYes);
      notifications.assertSuccess('Successfully deleted', partner.dids.three);
      utils.expectTextToBeSet(partner.phoneNumbersCount, '1 Number');
    });
  });

  it('should delete an exisiting org thus deleting trial', function () {
    deleteTrialUtils.deleteOrg(orgId, accessToken);
    deleteUtils.deleteSquaredUCCustomer(orgId, accessToken);
  });

});
