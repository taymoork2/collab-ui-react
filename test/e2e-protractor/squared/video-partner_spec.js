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
      // make sure it's not playing
      expect(partner.isPaused()).toBe(true);

      expect(partner.videoLoadError()).toBe(null);

      // play video
      partner.playVideo();

      browser.sleep(3000);
      expect(partner.isPaused()).toBe(false);
      browser.sleep(3000);
    });

    it('click on close button of video modal', function () {
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
