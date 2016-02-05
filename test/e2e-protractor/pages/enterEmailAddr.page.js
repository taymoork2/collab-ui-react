'use strict';

var EnterEmailAddrPage = function () {
  this.h2 = element(by.id('h2'));
  this.pageLabel = element(by.id('label'));
  this.email = element(by.model('enterEmailAddrController.email'));
  this.nextButton = element(by.id('next'));
  this.errorMsg = element(by.model('enterEmailAddrController.error'));
};

module.exports = EnterEmailAddrPage;
