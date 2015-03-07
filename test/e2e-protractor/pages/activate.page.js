'use strict'

var ActivatePage = function () {
  this.provisionSuccess = element(by.id('provisionSuccess'));
  this.codeExpired = element(by.id('codeExpired'));
  this.resendSuccess = element(by.id('resendSuccess'));
  this.userEmail = element(by.binding('userEmail'));
  this.sendCodeLink = element(by.id('sendCodeLink'));
  this.testData = element(by.id('testdata'));
};

module.exports = ActivatePage;
