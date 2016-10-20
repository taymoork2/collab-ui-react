'use strict';

var TelephonyPage = function () {
  this.communicationPanel = element(by.cssContainingText('.section-title-row', 'Lines'));
  this.lineConfigurationPanel = element(by.cssContainingText('.section-title-row', 'Line Configuration'));
  this.close = element(by.id('close-preview-button'));
  this.loadingSpinner = element.all(by.css('.icon-spinner')).get(0);

  this.lineConfigurationActionButton = this.lineConfigurationPanel.element(by.css('button.actions-button'));
  this.removeButton = element(by.cssContainingText('a', 'Remove Line'));

  this.communicationActionButton = this.communicationPanel.element(by.css('button.actions-button'));
  this.newLineButton = element(by.cssContainingText('a', 'Add a New Line'));

  // voicemail related variabls
  this.voicemailFeature = element(by.cssContainingText('.feature', 'Voicemail')).element(by.cssContainingText('span', 'Voicemail'));
  this.voicemailStatus = element(by.cssContainingText('.feature', 'Voicemail')).element(by.css('.feature-status'));
  this.voicemailSave = element(by.name('voicemail.form')).element(by.buttonText('Save'));
  this.voicemailCancel = element(by.name('voicemail.form')).element(by.buttonText('Cancel'));
  this.disableVoicemailtitle = element(by.cssContainingText('h3', 'Disable Voicemail'));
  this.disableVoicemailCancel = element(by.css('.modal-footer')).element(by.buttonText('Cancel'));
  this.disableVoicemailSave = element(by.css('.modal-footer')).element(by.buttonText('Disable'));
  this.voicemailTitle = element(by.cssContainingText('.section-title-row', 'Voicemail'));
  this.voicemailSwitch = element(by.css('label[for="enableVoicemail"]'));

  this.directoryNumbers = element.all(by.css('.feature a[ui-sref="user-overview.communication.directorynumber({directoryNumber: directoryNumber})"]'));
  this.primary = element(by.cssContainingText('span', 'Primary'));
  this.voicemailFeature = element(by.cssContainingText('.feature a', 'Voicemail'));
  this.snrFeature = element(by.cssContainingText('.feature a', 'Single Number Reach'));
  this.squaredUCCheckBox = element(by.css('label[for="chk_ciscoUC"]'));

  this.saveButton = element(by.buttonText('Save'));
  this.cancelButton = element(by.buttonText('Cancel'));
  this.saveEntitlements = element(by.css('.user-entitlements-body')).element(by.id('btn-save'));

  this.cancelDisassociation = element(by.css('.modal-template')).element(by.css('.btn-default'));
  this.disassociateLine = element(by.css('.modal-template')).element(by.css('.btn-danger'));

  this.forwardNoneRadio = element(by.cssContainingText("label", "Do not forward calls"));
  this.forwardAllRadio = element(by.cssContainingText("label", "Forward all calls"));
  this.forwardBusyNoAnswerRadio = element(by.cssContainingText("label", "Forward calls when line is busy or away"));
  this.forwardAll = element(by.css('cs-combobox[name="forwardAllCalls"]'));
  this.forwardBusyNoAnswer = element(by.css('cs-combobox[name="forwardNABCalls"]'));
  this.forwardExternalCalls = element(by.css('label[for="ckForwardExternalCalls"]'));
  this.forwardExternalBusyNoAnswer = element(by.css('cs-combobox[name="forwardExternalNABCalls"]'));

  this.snrTitle = element(by.cssContainingText('.section-title-row', 'Single Number Reach'));
  this.snrSwitch = element(by.css('label[for="enableSnr"]'));
  this.snrNumber = element(by.id('destination'));
  this.snrStatus = this.snrFeature.element(by.css('.feature-status'));

  this.internalNumber = element(by.css('.select-list[name="internalNumber"] a.select-toggle'));
  this.internalNumberOptionFirst = element(by.css('.select-list[name="internalNumber"]')).all(by.repeater('option in csSelect.options')).first().element(by.tagName('a'));
  this.externalNumber = element(by.css('.select-list[name="externalNumber"] a.select-toggle'));
  this.externalNumberOptionLast = element(by.css('.select-list[name="externalNumber"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));

  this.callerId = element(by.css('.select-list[name="callerIdSelection"] a.select-toggle'));
  this.callerIdOptionFirst = element(by.css('.select-list[name="callerIdSelection"]')).all(by.repeater('option in csSelect.options')).first().element(by.tagName('a'));
  this.callerIdOptionLast = element(by.css('.select-list[name="callerIdSelection"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));

  this.esnTail = element(by.id('esnTail'));

  this.sharedLineToggle = element(by.css('.shared-line-toggle'));
  this.userInput = element(by.id('userInput'));
  this.removeMemberLink = element(by.id('removeMemberLink'));
  this.removeMemberBtn = element(by.id('removeMemberButton'));

  this.userAccordionGroup = function (user) {
    var accordion = element(by.id(user + '-AccordionGroup'));
    return accordion;
  };

  this.selectSharedLineOption = function (user) {
    var selected = element(by.cssContainingText('.shared-line .dropdown-menu li', user));
    utils.click(selected);
  };

  this.selectSharedLineUser = function (user) {
    var selected = element(by.id(user + '-AccordionGroup')).element(by.tagName('a'));
    utils.click(selected);
  };

  this.retrieveInternalNumber = function () {
    utils.wait(this.internalNumber);
    return this.internalNumber.evaluate('csSelect.selected.pattern');
  };

  this.retrieveExternalNumber = function () {
    utils.wait(this.externalNumber);
    return this.externalNumber.evaluate('csSelect.selected.pattern');
  };

  this.retrieveCallerId = function () {
    utils.wait(this.callerId);
    return this.callerId.evaluate('csSelect.selected.label');
  };

  this.selectOption = function (dropdown, option) {
    utils.click(dropdown.element(by.css('.combo-btn')));
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
