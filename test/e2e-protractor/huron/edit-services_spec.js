'use strict';

describe('Advanced Spark Call Add User flow', function () {

  var inputEmail = utils.randomTestGmail();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', inputEmail);
  }, 120000);

  describe('To remove Advanced Spark Call from the user', function () {
    it('should uncheck Advanced Spark Call checkbox', function () {
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(users.editServicesModal);
        utils.click(users.advancedCommunications);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
      });
    });
    it('should not have communications visible', function () {
      utils.clickUser(inputEmail);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.expectIsNotDisplayed(users.communicationsService);
    });
  });

  describe('To entitle Advanced Spark Call to the user again', function () {
    it('should check Advanced Spark Call checkbox and close the preview panel', function () {
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(users.editServicesModal);
        utils.click(users.advancedCommunications);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
      });
    });
    it('should show the Communications service', function () {
      utils.clickUser(inputEmail);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.expectIsDisplayed(users.communicationsService);
    });
    it('should have a line/directory number again', function () {
      utils.click(users.communicationsService);
      utils.expectIsDisplayed(telephony.communicationPanel);
      utils.expectCount(telephony.directoryNumbers, 1);
    });
    it('should have voicemail on', function () {
      utils.expectIsDisplayed(telephony.voicemailFeature);
      utils.expectText(telephony.voicemailStatus, 'On');
    });
  });

  afterAll(function () {
    utils.deleteUser(inputEmail);
  });

});
