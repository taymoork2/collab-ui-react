'use strict';

var EnterEmailAddrPage = function () {
  this.h2 = element(by.id('dr-enter-email-addr-header'));
  this.pageLabel = element(by.id('dr-enter-email-addr-label'));
  this.email = element(by.model('enterEmailAddrController.email'));
  this.nextButton = element(by.id('dr-enter-email-addr-next'));
  this.errorMsg = element(by.model('enterEmailAddrController.error'));
  this.drReferrer = "digitalriver-ZGlnaXRhbHJpdmVy";
};

module.exports = EnterEmailAddrPage;
