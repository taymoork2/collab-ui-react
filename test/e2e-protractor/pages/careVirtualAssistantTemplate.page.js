'use strict';

var VirtualAssistantTemplateCreation = function () {
  this.title = element(by.css('.h3'));
  this.titleDesc = element(by.css('.h6'));

  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));

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
  this.nameHint = element(by.css('.ct-input-hint'));

  // Email page info
  this.email = element(by.name('input'));
  this.validEmailExtension = element(by.css('.valid-extension'));
  this.invalidEmailExtension = element(by.css('.invalid-extension'));
  this.disabledEmailExtension = element(by.css('.disabled-extension'));
  this.visibleCheckIcon = element(by.css('.icon.icon-check.icon-2x.visible'));
  this.errorMessage = element(by.css('.ct-input-error'));


  // Avatar upload/preview
  this.avatarUpload = element(by.id('avatarUpload'));
  this.avatarPreview = element(by.id('avatarPreview'));
  
  // Dialogflow Input Context
  this.dialogflowInputContextForm = element(by.id('fieldsetFormId'));
  this.dialogflowInputContextFieldInput1 = element(by.id('fieldInput1'));

  // Summary Page
  this.finishBtn = element(by.id('vaSetupFinishBtn'));
  this.editWarning = element(by.css('.edit-message'));

  // Cancel Modal
  this.cancelBtn = element(by.id('cancelChat'));

  // Delete Template

  // Expert Virtual Assistant
  this.defaultSpaceDropDown = element(by.id('defaultSpaceDropdown'));
};

module.exports = VirtualAssistantTemplateCreation;
