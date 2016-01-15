'use strict';

var AutoAttendantPage = function () {
  this.autoAttendantDevLink = element(by.css('a[href*="#/hurondetails/features"]'));
  this.newFeatureButton = element(by.css('.new-feature-button'));
  this.featureTypeAA = element(by.css('.feature-icon-color-AA'));
  this.newAAname = element(by.id('aa-name-detail'));
  this.addAANumbers = element(by.css('.aa-selected-phones .icon-chevron-down'));
  this.numberDropDownArrow = element(by.linkText('Search or Select a Number'));
  this.numberDropDownOptions = element(by.css(' .aa-selected-phones .select-options')).all(by.tagName('li'));
  this.saveButton = element(by.name('saveButton'));
  this.closeEditButton = element(by.css('button.close'));
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

  this.repeatPlus = element(by.css('.icon-plus-circle'));
  this.phoneMenuKeys = element.all(by.css('div.aa-pm-key-select .icon-chevron-down'));
  this.phoneMenuKeyOptions = element.all(by.css('div.aa-pm-key-select .dropdown-menu'));
  this.phoneMenuAction = element.all(by.css('div.aa-pm-action-select .icon-chevron-down'));
  this.phoneMenuActionOptions = element.all(by.css('div.aa-pm-action-select div.dropdown-menu'));

  this.phoneMenuActionTargets = element.all(by.css('div.aa-key-action'));

  this.phoneMenuTimeout = element(by.css('div.aa-pm-timeout .icon-chevron-down'));
  this.phoneMenuTimeoutOptions = element(by.css('div.aa-pm-timeout div.dropdown-menu')).all(by.tagName('li')).first();

  this.trash = element.all(by.css('.aa-trash-icon')).last();

  this.assertUpdateSuccess = assertUpdateSuccess;
  this.assertCreateSuccess = assertCreateSuccess;
  this.waitForElementPresent = waitForElementPresent;

  function waitForElementPresent(someElmFinder) {
    var i = 0;
    var _retryOnErr = function (err) {
      console.log(' <<< warning: wait retrying iteration: ' + i + ' >>> ');
      browser.sleep(500);
      return false;
    };

    browser.driver.wait(function () {
      i++;
      return someElmFinder.isPresent().then(function (present) {
        if (present) {
          return true;
        } else {
          return _retryOnErr();
        }
      }, _retryOnErr);
    }, 120 * 1000, 'Error waiting for element present: ').
    then(function (waitRetValue) {
      return waitRetValue; // usually just `true`
    }, function (err) {
      throw err + ' after ' + i + ' iterations.';
    });
  }

  function assertUpdateSuccess() {
    waitForElementPresent(notifications.successAlert);
    expect(notifications.successAlert.getText()).toContain(deleteUtils.testAAName + ' updated successfully');
  }

  function assertCreateSuccess() {
    waitForElementPresent(notifications.successAlert);
    expect(notifications.successAlert.getText()).toContain(deleteUtils.testAAName + ' created successfully');
  }

};

module.exports = AutoAttendantPage;
