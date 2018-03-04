'use strict';

var CareFeatureLandingPage = function () {
  this.careNewFeatureModal = element(by.css('.care-new-feature-modal'));
  this.features = element.all(by.css('.care-new-feature-modal .feature-icon-container'));
  // For the 1st landing page;
  this.createCustomerSupportTemplateButton = element(by.css('.icon-picture-in-picture'));
  this.createVirtualAssistantTemplateButton = element(by.css('.virtual-assistant-icon'));
  // For the Customer Support Template landing page
  this.createChatTemplateButton = this.features.get(0);
  this.createCallbackTemplateButton = this.features.get(1);
  this.createChatPlusCallbackTemplateButton = this.features.get(2);
  // For the Virtual Assistant landing page
  this.createCustomerVirtualAssistantTemplateButton = this.features.get(0);
  this.createExpertVirtualAssistantTemplateButton = this.features.get(1);
};

module.exports = CareFeatureLandingPage;
