'use strict';

/* global LONG_TIMEOUT, deleteTrialUtils */

//TODO reenable after pstn change
describe('Spark UC Partner flow', function () {
  var orgId;
  var accessToken;

  describe('Add Partner Trial', function () {

    it('should login', function () {
      login.login('huron-e2e-partner', '#/partner/customers').then(function (token) {
        accessToken = token;
      });
    });

    it('should add a new trial without advanced spark call', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.messageTrialCheckbox);
        utils.expectIsDisplayed(partner.squaredUCTrialCheckbox);

        utils.sendKeys(partner.customerNameInput, partner.newSqUCTrial.customerName);
        utils.sendKeys(partner.customerEmailInput, partner.newSqUCTrial.customerEmail);

        // uncheck advanced spark call
        utils.expectInputCheckbox(partner.squaredUCTrialCheckbox, true);
        utils.click(partner.squaredUCTrialCheckbox);
        utils.expectInputCheckbox(partner.squaredUCTrialCheckbox, false);

        utils.click(partner.startTrialButton);
        notifications.assertSuccess(partner.newSqUCTrial.customerName, 'A trial was successfully started');
        utils.clickEscape();
      });
    }, LONG_TIMEOUT);

    it('should find new trial', function (done) {
      utils.click(partner.trialFilter);
      utils.expectIsDisplayed(partner.newSqUCTrialRow);

      partner.retrieveOrgId(partner.newSqUCTrialRow).then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    });

    it('should edit trial and enable advanced spark call', function () {
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.termsActionButton);
      utils.click(partner.editTermsButton);

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.editTrialForm);

        utils.waitClass(partner.messageTrialCheckbox, 'disabled');
        utils.expectInputCheckbox(partner.messageTrialCheckbox, true);

        // enabled advanced spark call
        utils.expectCheckbox(partner.squaredUCTrialCheckbox, false);
        utils.click(partner.squaredUCTrialCheckbox);
        utils.expectInputCheckbox(partner.squaredUCTrialCheckbox, true);

        utils.click(partner.saveUpdateButton);
        notifications.assertSuccess(partner.newSqUCTrial.customerName, 'You have successfully edited a trial for');
      });
    }, LONG_TIMEOUT);

    it('should edit trial and verify services are checked and disabled', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.termsActionButton);
      utils.click(partner.editTermsButton);

      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(partner.editTrialForm);

        utils.waitClass(partner.messageTrialCheckbox, 'disabled');
        utils.expectInputCheckbox(partner.messageTrialCheckbox, true);

        // verify checkbox is checked and disabled
        utils.waitClass(partner.squaredUCTrialCheckbox, 'disabled');
        utils.expectInputCheckbox(partner.squaredUCTrialCheckbox, true);

        utils.click(partner.saveUpdateButton);
        notifications.assertSuccess(partner.newSqUCTrial.customerName, 'You have successfully edited a trial for');
      });
    }, LONG_TIMEOUT);

    xit('should add two new did to the trial', function () {
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

    xit('should delete second did from the trial', function () {
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

    xit('should delete third did from manage numbers list', function () {
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

  afterAll(function () {
    deleteTrialUtils.deleteOrg(orgId, accessToken);
    deleteUtils.deleteSquaredUCCustomer(orgId, accessToken);
  });

});
