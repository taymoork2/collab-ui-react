'use strict';

/* global deleteTrialUtils */
/* global LONG_TIMEOUT */

describe('Video play spec', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Launch video flow', function () {
    it('should login and redirect to the partner admin page', function () {
      login.loginThroughGui(helper.auth['partner-admin'].user, helper.auth['partner-admin'].pass, '#/partner/overview');
    });

    it('should display correct navigation colors', function () {
      utils.expectClass(navigation.body, 'inverse');
    });

    it('should launch video', function () {
      navigation.videoTutorial();
    });

    it('should play video', function () {
      utils.expectTruthy(partner.isPaused());
      utils.waitForPresence(partner.videoModal, 2000);
      partner.videoLoads();
      partner.playVideo();
      partner.isPlay();
    });

    it('click on close button of video modal', function () {
      utils.expectIsDisplayed(partner.closeBtnOnModal);
      utils.click(partner.closeBtnOnModal);
    });

    it('should logout', function () {
      navigation.logout();
    });
  });

  describe('Verify video link in partner sales admin', function () {
    it('should login and redirect to the partner sales admin page', function () {
      login.loginThroughGui(helper.auth['partner-sales-user'].user, helper.auth['partner-sales-user'].pass, '#/partner/overview');
    });

    it('customer page should have video link', function () {
      navigation.videoTutorial();
      utils.expectIsDisplayed(partner.closeBtnOnModal);
      utils.click(partner.closeBtnOnModal);
    });

    it('should logout', function () {
      navigation.logout();
    });
  });

  describe('No video link in user view', function () {
    it('should login and redirect to the requested users page', function () {
      login.loginThroughGui(helper.auth['pbr-admin'].user, helper.auth['pbr-admin'].pass, '#/users');
    });

    it('customer page should not have video link', function () {
      utils.expectIsNotDisplayed(navigation.videoLink);
    });

    it('should logout', function () {
      navigation.logout();
    });
  });
});
