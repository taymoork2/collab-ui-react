'use strict';

var AutoAttendantPage = function () {
  this.autoAttendantDevLink = element(by.css('a[href*="#/hurondetails/features"]'));
  this.newFeatureButton = element(by.css('.new-feature-button'));
  this.featureTypeAA = element(by.css('.feature-icon-color-AA'));
  this.newAAname = element(by.id('aa-name-detail'));
  this.addAANumbers = element(by.css('.icon-arrow-down'));
  this.numberDropDownArrow = element(by.linkText('Search or Select a Number'));
  this.numberDropDownOptions = element(by.css('.select-options')).all(by.tagName('li'));
  this.saveButton = element(by.name('saveButton'));
  this.numberIconClose = element.all(by.css('.icon-close')).last();
  this.sayMessage = element(by.cssContainingText('.aa-message-panel', 'Say Message'));
  this.sayMessageInput = element(by.name('sayMessageInput'));
  this.sayMessageLanguage = element(by.css('select[name="languageSelect"] + div a.select-toggle'));
  this.languageDropDownOptions = element(by.css('select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.sayMessageVoice = element(by.css('select[name="voiceSelect"] + div a.select-toggle'));
  this.sayMessageVoiceOptions = element(by.css('select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
};

module.exports = AutoAttendantPage;
