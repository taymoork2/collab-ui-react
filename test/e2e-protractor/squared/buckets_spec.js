'use strict';

describe('Invite User and Check Buckets', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  var addEmail = utils.randomTestGmailwithSalt('buckets');

  //log in as admin with an account
  describe('Account Add User', function () {
    it('should login and view users', function () {
      login.login('account-admin', '#/users');
    });

    it('should ensure calendar service enabled', function () {
      navigation.ensureHybridService(navigation.calendarServicePage);
    });

    it('should ensure call service enabled', function () {
      navigation.ensureHybridService(navigation.callServicePage);
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      navigation.clickUsers();
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    describe('Add users', function () {
      it('should clear user input field and error message', function () {
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectTextToBeSet(users.addUsersField, '');
        utils.expectIsDisabled(users.nextButton);
      });

      it('click on enable services individually', function () {
        utils.sendKeys(users.addUsersField, addEmail);
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.nextButton);
        utils.expectIsDisplayed(users.messageLicenses);
        utils.expectIsDisplayed(users.conferenceLicenses);
        utils.expectIsDisplayed(users.communicationLicenses);
      });

      it('click on Hybrid Services individually', function() {
        // Defualt is all check boxes unchecked
        utils.expectCheckbox(users.hybridServices_Cal, false);
        utils.expectCheckbox(users.hybridServices_UC, false);
        utils.expectCheckbox(users.hybridServices_EC, false);

        // Hybrid services call label should say "call service aware" when connect available
        utils.expectTextToBeSet(users.hybridServices_UC, 'Call Service Aware');

        // clicking UC should ONLY enable UC
        utils.click(users.hybridServices_UC);
        utils.expectCheckbox(users.hybridServices_UC, true);
        utils.expectCheckbox(users.hybridServices_EC, false);
        utils.click(users.hybridServices_UC);

        // clicking EC should ALSO enable UC
        utils.click(users.hybridServices_EC);
        utils.expectCheckbox(users.hybridServices_UC, true);
        utils.expectCheckbox(users.hybridServices_EC, true);

        // unclicking EC should ONLY unclick EC
        utils.click(users.hybridServices_EC);
        utils.expectCheckbox(users.hybridServices_UC, true);
        utils.expectCheckbox(users.hybridServices_EC, false);
        utils.click(users.hybridServices_EC, true);

        // unclicking UC should ALSO unclick EC
        utils.click(users.hybridServices_UC);
        utils.expectCheckbox(users.hybridServices_UC, false);
        utils.expectCheckbox(users.hybridServices_EC, false);
      });

      it('should add users successfully', function () {
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'onboarded successfully');
        utils.expectIsNotDisplayed(users.manageDialog);
      });

      it('should logout', function() {
        navigation.logout();
      });
    });

    describe('Should confirm non-Hybrid Call Connect case', function() {
      it('should login pbr-admin', function() {
        login.login('pbr-admin', '#/users');
      });

      it('should confirm Hybrid Services shows "Call Service" only', function() {
        navigation.clickUsers();
        utils.click(users.addUsers);
        utils.expectIsDisplayed(users.manageDialog);

        utils.sendKeys(users.addUsersField, addEmail);
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.nextButton);

        utils.expectTextToBeSet(users.hybridServices_UC, 'Call Service');        
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    afterAll(function () {
      deleteUtils.deleteUser(addEmail);
    });
  });
});
