'use strict';

describe('Service Setup tests', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('interacting with various menus', function () {
    it('should login as with a non partner account', function () {
      login.login('sqtest-admin');
    });

    it('should show the plan review flow', function () {
      navigation.clickFirstTimeWizard();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
    });

    it('should show the add users flow', function () {
      navigation.clickAddUsers();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
      utils.click(inviteusers.bulkUpload);
    });

    it('should show the enterprise settings flow', function () {
      navigation.clickEnterpriseSettings();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
    });

    it('should show the communications flow', function () {
      navigation.clickCommunicationWizard();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Call Settings');
    });

    it('should show the messaging flow', function () {
      navigation.clickMessagingSetup();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Message Settings');
    });

    afterEach(function () {
      utils.clickEscape();
    });
  });
});
