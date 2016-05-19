'use strict';

var ChatTemplateCreation = function () {
  this.randomChatTemplateName = 'e2e-careChatTemplate-' + utils.randomId();
  this.testOrgName = 'e2e-test-org-name';
  this.setUpTitle = element(by.css('.ct-title .h1'));
  this.setUpDesc = element(by.css('.h4.ct-title-desc'));
  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
  this.typeAheadInput = element(by.css('.typeahead-large .ct-input'));
  this.nameHint = element(by.css('.typeahead-large .ct-input-hint'));
  this.profileTitle = element(by.css('.ct-title.h1'));
  this.profileTitleDesc = element(by.css('.ct-title-desc.h4'));
  this.orgProfile = element.all(by.css('.cs-input-group.cs-input-radio span')).first();
  this.agentProfile = element.all(by.css('.cs-input-group.cs-input-radio span')).last();
  this.orgOrAgentNamePreview = element(by.css('.name-details .orgOrAgentName'));
  this.OrgName = element(by.css('.cs-input-group.cs-input-text input'));
  this.agentAliasRadio = element.all(by.css('.agent-name-options cs-radio')).first();
  this.agentNameRadio = element.all(by.css('.agent-name-options cs-radio')).last();
  this.agentPreviewIcon = element(by.css('.img-details .icon-user'));
  this.previewMinimizeIcon = element(by.css('.action-details .icon-minus'));
  this.previewCloseIcon = element(by.css('.action-details .icon-close'));
  this.agentDisplayImage = element(by.css('.ct-profile-agent-img .icon-user'));
  this.customerInfoToggle = element.all(by.css('.toggle-switch')).first();
  this.overviewCard = element.all(by.css('.ct-card-overview'));
  this.customerInfoEnabledCard = element.all(by.css('.ct-card-border-enabled')).first();
  this.customerInfoDisabledCard = element.all(by.css('.ct-card-border-disabled')).first();
  this.customerInfo_Header_Welcome = element(by.css('.welcomeText'));
  this.customerInfo_Header_Org = element(by.css('.orgText'));
  this.customerInfo_attCard_default_Content = element(by.css('.ct-default-msg'));
  this.customerInfo_attCard_textField1 = element.all(by.css('.ct-attribute-field-textbox')).get(0);
  this.customerInfo_attCard_textField2 = element.all(by.css('.ct-attribute-field-textbox')).get(1);
  this.customerInfo_attCard_textField3 = element.all(by.css('.ct-attribute-field-textbox')).get(2);
  this.customerInfo_attCard_textField4 = element.all(by.css('.ct-attribute-field-textbox')).get(3);
  this.customerInfo_screen_div1 = element.all(by.css('.ct-left-row')).get(0);
  this.customerInfo_screen_field1Label = element.all(by.css('.labelText')).get(0);
  this.customerInfo_screen_div2 = element.all(by.css('.ct-left-row')).get(1);
  this.customerInfo_screen_optional1 = element(by.id('optionalField1'));
  this.customerInfo_screen_optional2 = element(by.id('optionalField2'));
  this.customerInfo_screen_optional3 = element(by.id('optionalField3'));
  this.customerInfo_attCard_redioOptional = element.all(by.css('.cs-radio')).get(1);
};

module.exports = ChatTemplateCreation;
