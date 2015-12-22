'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

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

    it('should show the invite users flow', function () {
      navigation.clickAddUsers();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');
      utils.click(inviteusers.bulkUpload);
    });

    it('should show the enterprise settings flow', function () {
      navigation.clickEnterpriseSettings();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
    });

    it('should show the communications flow', function () {
      navigation.clickCommunicationWizard();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Unified Communications');
    });

    it('should show the messanging flow', function () {
      navigation.clickMessagingSetup();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Messaging Setup');
    });

    afterEach(function () {
      utils.clickEscape();
    });
  });
});
