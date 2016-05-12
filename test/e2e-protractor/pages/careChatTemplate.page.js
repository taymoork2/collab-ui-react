'use strict';

var ChatTemplateCreation = function () {
  this.randomChatTemplateName = 'e2e-careChatTemplate-' + utils.randomId();
  this.setUpTitle = element(by.css('.ct-title .h1'));
  this.setUpDesc = element(by.css('.h4.ct-title-desc'));
  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
  this.typeAheadInput = element(by.css('.typeahead-large .ct-input'));
  this.nameHint = element(by.css('.typeahead-large .ct-input-hint'));
  this.customerInfoToggle = element.all(by.css('.toggle-switch')).first();
  this.customerInfoEnabledCard = element.all(by.css('.ct-card-border-enabled')).first();
  this.customerInfoDisabledCard = element.all(by.css('.ct-card-border-disabled')).first();

};

module.exports = ChatTemplateCreation;
