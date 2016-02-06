'use strict';

describe('CMR shown under Enterprise Edition', function () {
  //TODO this is specific to integration account, need to fix for prod
  if (isProductionBackend) {
    return;
  }
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Display the invite page', function () {
    it('should login as multiple-subscription-user and view users', function () {
      login.login('multiple-subscription-user', '#/users');
    });

    it('click on invite user button should pop up the page', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });
  });

  // This org does not have EE license, someone from the WebEx team needs to take a look.
  // Comment out this test for now
  xdescribe('should show CMR under EE', function () {
    it('if there is EE should show CMR option', function () {
      utils.sendKeys(users.addUsersField, utils.randomTestGmail());
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.nextButton);
      utils.expectIsDisplayed(users.servicesPanelCommunicationsCheckbox);
      utils.click(users.servicesPanelCommunicationsCheckbox);
    });

    it('clicking on cancel button should close the modal', function () {
      utils.click(users.closeAddUsers);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

});
