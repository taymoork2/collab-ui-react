'use strict';

var CareSettingsPage = function () {
  this.pickRouting = element.all(by.model('localCareSettings.queueConfig.selectedRouting')).first();
  this.pushRouting = element.all(by.model('localCareSettings.queueConfig.selectedRouting')).last();
  this.chatCount = element(by.model('localCareSettings.orgChatConfig.selectedChatCount'));
  this.chatToVideoToggle = element(by.model('localCareSettings.orgChatConfig.selectedVideoInChatToggle'));
  this.careSettingsSaveButton = element(by.css('.save-care-section .btn.btn--primary'));
  this.modalBody = element(by.css('.modal-content .modal-body'));
  this.modalSave = element(by.css('.modal-footer .btn.btn--primary'));
};

module.exports = CareSettingsPage;
