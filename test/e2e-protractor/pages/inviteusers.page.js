'use strict';

var InviteUsers = function () {
  this.bulkUpload = element(by.cssContainingText('span', 'Bulk upload users using CSV'));
  this.submenuCSV = element(by.cssContainingText('.wizard-menu-subtitle', 'Upload CSV'));
  this.advancedSparkCall = element(by.cssContainingText('span', 'Advanced Spark Call'));
  this.nextButton = element(by.buttonText('Next'));
  this.finishButton = element(by.buttonText('Finish'));
  this.fileElem = element(by.css('#upload'));
  this.progress = element(by.css('.progressbar-progress'));
  this.upload_finished = element(by.css('.icon-check-mark-success'));
};

module.exports = InviteUsers;
