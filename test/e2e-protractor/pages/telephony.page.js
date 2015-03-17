'use strict';

var TelephonyPage = function () {
  this.communicationPanel = element(by.cssContainingText('.section-title-row', 'Spark UC'));
  this.lineConfigurationPanel = element(by.cssContainingText('.section-title-row', 'Line Configuration'));

  this.lineConfigurationActionButton = this.lineConfigurationPanel.element(by.css('button.actions-button'));
  this.removeButton = element(by.cssContainingText('a', 'Remove Line'));

  this.communicationActionButton = this.communicationPanel.element(by.css('button.actions-button'));
  this.newLineButton = element(by.cssContainingText('a', 'Add a New Line'));

  this.directoryNumbers = element.all(by.repeater('directoryNumber in telephonyOverview.telephonyInfo.directoryNumbers track by directoryNumber.uuid')).all(by.tagName('a'));
  this.primary = element(by.cssContainingText('span', 'Primary'));
  this.voicemailFeature = element(by.cssContainingText('.feature a', 'Voicemail'));
  this.snrFeature = element(by.cssContainingText('.feature a', 'Single Number Reach'));
  this.close = element(by.id('close-preview-button'));
  this.squaredUCCheckBox = element(by.css('label[for="chk_ciscoUC"]'));

  this.saveButton = element(by.buttonText('Save'));
  this.cancelButton = element(by.buttonText('Cancel'));
  this.saveEntitlements = element(by.css('.user-entitlements-body')).element(by.id('btn-save'));

  this.cancelDisassociation = element(by.css('.modal-template')).element(by.css('.btn-default'));
  this.disassociateLine = element(by.css('.modal-template')).element(by.css('.btn-danger'));

  this.forwardNoneRadio = element(by.cssContainingText("span", "Do not forward calls"));
  this.forwardAllRadio = element(by.cssContainingText("span", "Forward all calls"));
  this.forwardBusyNoAnswerRadio = element(by.cssContainingText("span", "Forward calls when line is busy or away"));
  this.forwardAll = element(by.id('cfa'));
  this.forwardBusyNoAnswer = element(by.id('cfbna'));
  this.forwardExternalCalls = element(by.css('label[for="ckForwardExternalCalls"]'));
  this.forwardExternalBusyNoAnswer = element(by.id('cfbnaExternal'));

  this.voicemailSwitch = element(by.css('label[for="enableVoicemail"]'));
  this.voicemailStatus = this.voicemailFeature.element(by.css('.feature-status'));

  this.snrSwitch = element(by.css('label[for="enableSnr"]'));
  this.snrNumber = element(by.id('number'));
  this.snrStatus = this.snrFeature.element(by.css('.feature-status'));

  this.internalNumber = element(by.id('internalNumber'));
  this.externalNumber = element(by.id('externalNumber'));

  this.callerIdDefault = element(by.css('label[for="callerIdDefault"]'));
  this.callerIdCustom = element(by.css('label[for="callerIdOther"]'));
  this.callerId = element(by.id('other'));

  this.retrieveInternalNumber = function () {
    utils.wait(this.internalNumber);
    return this.internalNumber.evaluate('lineSettings.assignedInternalNumber.pattern');
  };

  this.retrieveExternalNumber = function () {
    utils.wait(this.externalNumber);
    return this.externalNumber.evaluate('lineSettings.assignedExternalNumber.pattern');
  };

  this.selectOption = function (dropdown, option) {
    utils.click(dropdown.element(by.css('.input-group-btn')));
    utils.click(dropdown.element(by.cssContainingText('a', option)));
  };

  this.setNumber = function (dropdown, number) {
    var input = dropdown.element(by.css('input'));
    utils.click(input);
    utils.sendKeys(input, number);
  };

  this.getRandomNumber = function () {
    return Math.ceil(Math.random() * Math.pow(10, 10)).toString();
  };

  this.waitForNewInternalNumber = function () {
    browser.wait(function () {
      return this.retrieveInternalNumber().then(function (pattern) {
        return pattern && pattern !== 'Choose a Number';
      });
    }.bind(this), 20000, 'Waiting for new internal number');
  };
};

module.exports = TelephonyPage;
