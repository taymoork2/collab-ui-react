'use strict';

var AutoAttendantPage = function () {
  this.autoAttendantDevLink = element(by.css('a[href*="#/hurondetails/features"]'));
  this.newFeatureButton = element(by.css('.new-feature-button'));
  this.featureTypeAA = element(by.css('.feature-icon-color-AA'));
  this.basicAA = element(by.css('.icon-Basic'));
  this.customAA = element(by.css('.icon-Custom'));
  this.newAAname = element(by.id('aa-name-detail'));
  this.addAANumbers = element(by.css('.aa-selected-phones .icon-chevron-down'));
  this.numberDropDownArrow = element(by.linkText('Search or Select a Number'));
  this.numberDropDownOptions = element(by.css(' .aa-selected-phones .select-options')).all(by.tagName('li'));
  this.saveButton = element(by.name('saveButton'));
  this.closeEditButton = element(by.id('close-panel'));
  this.testCardName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));

  this.testCardDelete = this.testCardName.element(by.xpath('ancestor::article')).element(by.css('.icon-trash'));

  this.deleteModalConfirmText = element(by.id('deleteHuronFeatureModal')).element(by.css('.modal-body')).element(by.css('span'));

  this.deleteModalConfirmButton = element(by.id('deleteFeature'));

  this.numberIconClose = element.all(by.css('.icon-close')).last();
  this.sayMessageBody = element(by.css('div.aa-panel-body[name="Say Message"]'));

  this.sayMessage = element(by.cssContainingText('.aa-message-panel', 'Say Message'));
  this.sayMessageInput = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.name('sayMessageInput'));
  this.sayMessageLanguage = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="languageSelect"] + div a.select-toggle'));
  this.languageDropDownOptions = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.sayMessageVoice = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="voiceSelect"] + div a.select-toggle'));
  this.sayMessageVoiceOptions = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.phoneMenu = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message'));
  this.phonesayMessageInput = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message [name="sayMessageInput"]'));
  this.phonesayMessageLanguage = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="languageSelect"] + div a.select-toggle'));
  this.phonelanguageDropDownOptions = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.phonesayMessageVoice = this.phoneMenu.element(by.css('select[name="voiceSelect"] + div a.select-toggle'));
  this.phonesayMessageVoiceOptions = this.phoneMenu.element(by.css('select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.addPlus = element(by.css('.aa-add-step-icon'));
  this.repeatPlus = element(by.css('.icon-plus-circle'));
  this.phoneMenuKeys = element.all(by.css('div.aa-pm-key-select .icon-chevron-down'));
  this.phoneMenuKeyOptions = element.all(by.css('div.aa-pm-key-select .dropdown-menu'));
  this.phoneMenuAction = element.all(by.css('div.aa-pm-action-select .icon-chevron-down'));
  this.phoneMenuActionOptions = element.all(by.css('div.aa-pm-action-select div.dropdown-menu'));
  this.phoneMenuActionTargets = element.all(by.css('div.aa-key-action'));

  this.phoneMenuTimeout = element(by.css('div.aa-pm-timeout .icon-chevron-down'));
  this.phoneMenuTimeoutOptions = element(by.css('div.aa-pm-timeout div.dropdown-menu')).all(by.tagName('li')).first();

  this.addStep = element.all(by.css('div.aa-panel-round')).first();
  this.addStepLast = element.all(by.css('div.aa-panel-round')).last();

  this.newStep = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  });

  this.newStepMenu = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  }).first().all(by.css("div.aa-flex-row")).last();

  // first item in newStep dropdown: Say Message
  this.newStepSelectFirst = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  }).first().all(by.css("div.aa-flex-row")).last().all(by.tagName('li')).first();

  // middle/second item in newStep dropdown: Phone Menu
  this.newStepSelectMiddle = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  }).first().all(by.css("div.aa-flex-row")).last().all(by.tagName('li')).get(1);

  // last/third item in newStep dropdown: Transfer
  this.newStepSelectLast = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  }).first().all(by.css("div.aa-flex-row")).last().all(by.tagName('li')).last();

  // since we added a Say Message via Add New Step, there should be more than 1 from now on.
  // Get them all so we can check:
  this.sayMessageAll = element.all(by.cssContainingText('.aa-message-panel', 'Say Message'));

  // and select the first one (which we added via Add New Step) for further tests
  this.sayMessageInputFirst = this.sayMessageAll.first().element(by.name('sayMessageInput'));

  // since we added a Phone Menu via Add New Step, there should be more than 1 from now on.
  // Get them all so we can check:
  this.phoneMenuAll = element.all(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message'));

  this.phoneSayMessageLanguageFirst = this.phoneMenuAll.first().all(by.name('languageSelect')).first().element(by.css('a.select-toggle'));

  // let's select galacian (10th selection starting from 0 == 9) for a change of pace
  this.phoneLanguageDropDownOptionsTenth = this.phoneMenuAll.first().all(by.name('languageSelect')).first().element(by.css('div.dropdown-menu')).all(by.tagName('li')).get(9);

  this.routeCall = element(by.css('div.aa-panel-body[name="Route Call"]'));
  this.routeCallChoose = this.routeCall.element(by.css('div.dropdown'));
  this.routeExternal = this.routeCall.element(by.css('div.dropdown-menu')).all(by.tagName('li')).last();
  this.routeExternalNumber = this.routeCall.element(by.css('input.phone-number'));

  this.trash = element.all(by.css('.aa-trash-icon')).last();

  this.schedule = element(by.css('.aa-schedule-container'));
  this.addschedule = element(by.linkText('Add Additional Hours'));
  this.starttime = element(by.id('starttime'));
  this.endtime = element(by.id('endtime'));
  this.day1 = element(by.cssContainingText('cs-checkbox', 'Monday'));
  this.scheduletrash = element(by.css('.aa-schedule-trash'));
  this.modalsave = element(by.id('saveOpenClosedBtn'));
  this.assertUpdateSuccess = assertUpdateSuccess;
  this.assertCreateSuccess = assertCreateSuccess;

  function assertUpdateSuccess() {
    notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');
  }

  function assertCreateSuccess() {
    notifications.assertSuccess(deleteUtils.testAAName + ' created successfully');
  }

};

module.exports = AutoAttendantPage;
