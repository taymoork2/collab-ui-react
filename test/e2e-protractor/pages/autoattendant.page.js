'use strict';

var AutoAttendantPage = function () {
  this.autoAttendantDevLink = element(by.css('a[href*="#/hurondetails/features"]'));
  this.newFeatureButton = element(by.css('.new-feature-button'));
  this.featureTypeAA = element(by.css('.feature-icon-color-AA'));
  this.name = element(by.model('nameCtrl.name'));
  this.addAANumbers = element(by.css('.icon-arrow-down'));
};

module.exports = AutoAttendantPage;
