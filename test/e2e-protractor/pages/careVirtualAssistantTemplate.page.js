'use strict';

var VirtualAssistantTemplateCreation = function () {
  this.title = element(by.css('.h3'));
  this.titleDesc = element(by.css('.h6'));

  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));

  this.closePanelX = element(by.id('close-panel'));

  // config overview page info
  this.dialogflowIsNotPreconfigured = element(by.cssContainingText('label', 'No, I don’t have a preconfigured Dialogflow agent'));
  this.dialogflowIsPreconfigured = element(by.cssContainingText('label', 'Yes, I have a preconfigured Dialogflow agent and am ready to proceed'));

  // Config dialog integration page info
  this.downloadEscalationIntentBtn = element(by.css('.btn.download-button'));

  // Access Token page info
  this.dialogflowClientAccessToken = element(by.name('tokenInput'));
  this.validateBtn = element(by.css('.btn.validate-button'));
  this.checkMarkIcon = element(by.css('.icon.icon-check'));

  // Name page info
  this.name = element(by.name('nameInput'));

  // Email page info
  this.email = element(by.name('input'));
  this.validEmailExtension = element(by.css('.valid-extension'));
  this.invalidEmailExtension = element(by.css('.invalid-extension'));
  this.visibleCheckIcon = element(by.css('.icon.icon-check.icon-2x.visible'));
  this.errorMessage = element(by.css('.ct-input-error'));


  // Avatar upload/preview
  this.avatarUpload = element(by.id('avatarUpload'));
  this.avatarPreview = element(by.id('avatarPreview'));

  // Summary Page
  this.finishBtn = element(by.id('vaSetupFinishBtn'));

  // Cancel Modal
  this.cancelBtn = element(by.id('cancelChat'));

  // Delete Template
};

module.exports = VirtualAssistantTemplateCreation;
