'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('CMR shown under Enterprise Edition', function () {
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

  describe('should show CMR under EE', function () {
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
    it('should log out', function () {
      navigation.logout();
    });
  });

});
