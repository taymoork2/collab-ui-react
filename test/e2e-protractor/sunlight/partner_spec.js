'use strict';

/* global LONG_TIMEOUT, deleteTrialUtils */

describe('Spark Care Partner flow', function () {
  var orgId;
  var accessToken;

  describe('Add Partner Trial', function () {

    it('should login as care partner', function () {
      login.login('partner-admin', '#/partner/customers').then(function (token) {
        accessToken = token;
      });
    });

    function expectAllOffersChecked() {
      utils.expectCheckbox(partner.messageTrialCheckbox, true);
      utils.expectCheckbox(partner.careTrialCheckbox, true);
      utils.expectCheckbox(partner.squaredUCTrialCheckbox, true);
      utils.expectCheckbox(partner.roomSystemsTrialCheckbox, true);
    }

    it('should add a new care trial', function () {
      utils.click(partner.trialFilter);
      utils.click(partner.addButton);

      utils.expectIsDisplayed(partner.addTrialForm);
      utils.expectIsDisabled(partner.startTrialButton);

      utils.expectIsDisplayed(partner.messageTrialCheckbox);
      utils.expectIsDisplayed(partner.careTrialCheckbox);

      expectAllOffersChecked();

      utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);

      // Disable other offers
      utils.click(partner.squaredUCTrialCheckbox);
      utils.click(partner.roomSystemsTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');
      utils.clickEscape();
    }, LONG_TIMEOUT);

    it('should find the new care trial', function (done) {
      utils.click(partner.trialFilter);
      utils.search(partner.newTrial.customerName, -1);
      utils.expectIsDisplayed(partner.newTrialRow);

      partner.retrieveOrgId(partner.newTrialRow).then(function (_orgId) {
        orgId = _orgId;
        done();
      });
    });

    afterAll(function () {
      deleteTrialUtils.deleteOrg(orgId, accessToken);
    });
  });
});
