'use strict';

var CareFeatureLandingPage = function () {
  this.careNewFeatureModal = element(by.css('.care-new-feature-modal'));
  this.features = element.all(by.css('.care-new-feature-modal .feature-icon-container'));
  this.createChatTemplateButton = this.features.get(0);
  this.createCallbackTemplateButton = this.features.get(1);
  this.createChatPlusCallbackTemplateButton = this.features.get(2);
  this.createVirtualAssistantTemplateButton = this.features.get(3);
};

module.exports = CareFeatureLandingPage;
