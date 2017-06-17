'use strict';

var CdrPage = function () {
  this.pageTitle = element(by.css('.title-heading'));

  this.searchRadio = element(by.id('searchRadio'));
  this.uploadRadio = element(by.id('uploadRadio'));

  this.callingPartyNumber = element(by.id('callingPartyNumber'));
  this.calledPartyNumber = element(by.id('calledPartyNumber'));
  this.callingPartyDevice = element(by.id('callingPartyDevice'));
  this.calledPartyDevice = element(by.id('calledPartyDevice'));
  this.startTime = element(by.id('startTime'));
  this.endTime = element(by.id('endTime'));
  this.startDate = element(by.id('startDate'));
  this.endDate = element(by.id('endDate'));
  this.hitSize = element(by.id('hitSize'));
  this.submit = element(by.id('submit'));
  this.reset = element(by.id('reset'));

  this.uploadFile = element(by.id('uploadFile'));
  this.uploadBtn = element(by.id('uploadBtn'));
};

module.exports = CdrPage;
