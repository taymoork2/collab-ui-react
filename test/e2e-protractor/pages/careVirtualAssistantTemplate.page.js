'use strict';

var VirtualAssistantTemplateCreation = function () {
  this.title = element(by.css('.va-title'));
  this.titleDesc = element(by.css('.va-title-desc'));

  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));

  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
  this.closePanelX = element(by.id('close-panel'));

  // config overview page info
  this.apiaiIsNotPreconfigured = element(by.cssContainingText('label', 'No, I don’t have a preconfigured API.AI agent'));
  this.apiaiIsPreconfigured = element(by.cssContainingText('label', 'Yes, I have a preconfigured API.AI agent and am ready to proceed'));

  // Config dialog integration page info
  this.downloadEscalationIntentBtn = element(by.css('.btn.download-button'));

  // Access Token page info
  this.apiaiClientAccessToken = element(by.name('tokenInput'));

  // Name page info
  this.name = element(by.name('nameInput'));

  // Summary Page
  this.finishBtn = element(by.id('vaSetupFinishBtn'));

  // Cancel Modal
  this.cancelTitle = element(by.css('.modal-title'));
  this.cancelDesc = element(by.css('ct-confirmation-message'));
  this.noCancelBtn = element(by.id('continueChat'));
  this.cancelBtn = element(by.id('cancelChat'));

  // Delete Template
};

module.exports = VirtualAssistantTemplateCreation;
