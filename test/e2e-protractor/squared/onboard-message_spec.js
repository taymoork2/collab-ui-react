'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Message Service', function () {
  var testUser = utils.randomTestGmailwithSalt('meetings');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  describe('Onboard user', function () {
    it('should add a user (Message On)', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.nextButton);
      utils.expectIsNotDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);

      utils.click(users.clearButton);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, testUser);
      utils.click(users.plusIcon);
      utils.click(users.nextButton);

      // Click message license
      utils.click(users.paidMsgCheckbox);   

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should automatically close wizard', function () {
      utils.expectIsNotDisplayed(wizard.wizard);
    });

    it('should show invite pending status on new user', function () {
      utils.search(testUser);
      utils.expectTextToBeSet(users.userListStatus, 'Invite Pending');
    });

    it('should confirm user added (Message On, Meeting Off)', function () {
      utils.clickUser(testUser);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.meetingService);
    });

    it('should add (Meeting On)', function () {
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        //click on license checkbox
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.click(users.closeSidePanel);
      });
    });

    it('should check (Message On, Meeting On) then uncheck them', function () {
      utils.clickUser(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);

      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, true);
        utils.expectCheckbox(users.paidMtgCheckbox, true);

        // Uncheck licenses...
        utils.click(users.paidMsgCheckbox);
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.click(users.closeSidePanel);
      });
    });

    it('should check (Message Off, Meeting Off)', function () {
      utils.clickUser(testUser);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);

      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, false);
        utils.expectCheckbox(users.paidMtgCheckbox, false);
        utils.click(users.cancelButton);
        utils.expectIsNotDisplayed(users.manageDialog);
        utils.click(users.closeSidePanel);
      });
    });  
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});