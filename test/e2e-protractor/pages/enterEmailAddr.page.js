'use strict';

var EnterEmailAddrPage = function () {
  this.pageTitle = element(by.id('title'));
  this.h2 = element(by.id('h2'));
  this.pageLabel = element(by.id('label'));
  this.email = element(by.model('email'));
  this.nextButton = element(by.id('next'));
  this.nextButton = element(by.model('error'));
};

module.exports = EnterEmailAddrPage;
