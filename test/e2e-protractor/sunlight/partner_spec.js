'use strict';

describe('Spark Care Partner flow', function () {
  describe('Add/Edit Partner Trial', function () {
    it('should login as care partner', function () {
      login.login('partner-admin', '#/partner/customers');
    });

    it('should add a new care trial', function () {
      utils.click(partner.addButton);

      utils.expectIsDisplayed(partner.editTrialForm);
      utils.expectIsDisabled(partner.startTrialButton);

      utils.expectIsDisplayed(partner.messageTrialCheckbox);
      utils.expectIsDisplayed(partner.careTrialCheckbox);

      // expect all offers checked
      utils.expectInputCheckbox(partner.messageTrialCheckbox, true);
      utils.expectInputCheckbox(partner.careTrialCheckbox, true);
      utils.expectInputCheckbox(partner.roomSystemsTrialCheckbox, true);
      utils.expectInputCheckbox(partner.sparkBoardTrialCheckbox, true);
      utils.setCheckboxIfDisplayed(partner.webexTrialCheckbox, false, 100);

      // expect call offer to not be checked
      utils.expectInputCheckbox(partner.squaredUCTrialCheckbox, false);

      utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);
      utils.click(partner.validLocationCheckbox); //set valid location checkbox

      // Disable other offers
      utils.click(partner.roomSystemsTrialCheckbox);
      utils.click(partner.sparkBoardTrialCheckbox);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');
      utils.clickEscape();
    });

    it('should find the newly added care trial in customer list', function (done) {
      clickTrialRowAndPreview();

      partner.retrieveOrgId(partner.newTrialRow).then(function () {
        done();
      });
    });

    // TODO: There is a delay seen with partner-admin test user to fetch and edit
    // trials, so excluding the test until we root cause the delay.
    xit('should reselect the care offer, change the care license and save',
      function (done) {
        clickTrialRowAndPreview();

        utils.click(partner.termsActionButton);
        utils.click(partner.editTermsButton);
        utils.click(partner.validLocationCheckbox);

        utils.waitForModal().then(function () {
          utils.expectIsDisplayed(partner.editTrialForm);

          utils.waitClass(partner.careTrialCheckbox, 'enabled');
          utils.expectCheckbox(partner.careTrialCheckbox, true);

          var licInput = partner.careLicenseCountTextbox;
          utils.waitUntilEnabled(licInput).then(function () {
            utils.sendKeysUpArrow(licInput, 5).then(function () {
              utils.click(partner.saveUpdateButton);
              notifications.assertSuccess(partner.newTrial.customerName,
                'You have successfully edited a trial for');
              utils.clickEscape();
              done();
            });
          });
        });
      });

    afterAll(function (done) {
      clickTrialRowAndPreview();

      utils.expectIsDisplayed(partner.deleteCustomerButton);
      utils.click(partner.deleteCustomerButton);
      utils.waitForModal().then(function () {
        utils.click(partner.deleteCustomerOrgConfirm).then(function () {
          notifications.assertSuccess(partner.newTrial.customerName, 'successfully deleted');
          done();
        });
      });
    });

    function clickTrialRowAndPreview() {
      navigation.clickCustomers();
      //utils.click(partner.trialFilter);
      utils.search(partner.newTrial.customerName, -1);
      utils.expectIsDisplayed(partner.newTrialRow);
      utils.click(partner.newTrialRow);
      utils.expectIsDisplayed(partner.previewPanel);
    }
  });
});
