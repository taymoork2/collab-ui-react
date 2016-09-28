'use strict';

var InviteUsers = function () {
  this.manualUpload = element(by.id('syncSimple.id'));
  this.bulkUpload = element(by.id('syncUpload.id'));
  this.submenuCSV = element(by.cssContainingText('.wizard-menu-subtitle', 'Upload CSV'));
  this.advancedSparkCall = element(by.cssContainingText('span', 'Advanced Call'));
  this.nextButton = element(by.id('wizardSaveNextBtn'));
  this.finishButton = element(by.id('wizardNext'));
  this.fileElem = element(by.css('#upload'));
  this.progress = element(by.css('.progressbar-progress'));
  this.upload_finished = element(by.css('.icon-check-mark-success'));
  this.addUsersTitle = element(by.css('.wizard-main-title span:first'));
  this.checkSIPAvailability = element(by.id('checkAvailabilityBtn'));
  this.confirmSaveCheckBox = element(by.css('label[for="confirmSaveCheckBox"]'));
  this.sipSubDomainInput = element(by.css('input.sip-domain-input'));
};

module.exports = InviteUsers;
