'use strict';

describe('Video play spec', function () {

  describe('Launch video flow', function () {
    it('should login with a partner admin', function () {
      login.login('partner-admin');
    });

    it('should launch video', function () {
      navigation.videoTutorial();
    });

    it('should play video', function () {
      utils.expectIsDisplayed(partner.videoModal);
      utils.expectTruthy(partner.isPaused());
      partner.videoLoads();
      partner.playVideo();
      partner.isPlay();
    });

    it('click on close button of video modal', function () {
      utils.click(partner.closeBtnOnModal);
      utils.expectIsNotDisplayed(partner.videoModal);
    });
  });
});
