'use strict';

/* global describe */
/* global it */
/* global browser */

describe('Org Features tests', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('User that has does not have message interop feature enabled', function () {
    it('should login as with a non admin account', function () {
      login.login('multiple-subscription-user');
    });

    it('should not show Webex Messager Integration from the plan review', function () {
      navigation.clickFirstTimeWizard();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
      wizard.clickMessagingSetup();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Message Settings');
      utils.expectIsNotPresent(wizard.messageInteropFeature);
    });

    it('should log out', function () {
      utils.clickEscape();
      navigation.logout();
    });
  });

  describe('User that does not have SIP URI feature enabled', function () {
    it('should login as with a non admin account', function () {
      login.login('multiple-subscription-user');
    });

    // at the time of writing the SIP URI is the only thing in the
    // Communications tab so if it gets removed, so too should the parent tab
    it('should not show the Communications tab', function () {
      navigation.clickFirstTimeWizard();
      wizard.clickPlanReview();
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
      utils.expectIsNotPresent(wizard.serviceSetupTab);
    });
  });
});
