'use strict';

describe('EVA feature setup', function () {
  beforeAll(function () {
    login.login('virtualassistant-admin', '#/services');
  });
  it('Services Page should have a CareCard with feature link.', function () {
    utils.expectIsDisplayed(careLandingPage.careCard);
    utils.expectIsDisplayed(careLandingPage.careIcon);
    utils.expectIsDisplayed(careLandingPage.careTitle);
    utils.expectIsDisplayed(careLandingPage.careFeature);
  });
  it('Care Card Feature should land on Care Page with create button', function () {
    utils.click(careLandingPage.careFeature);
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
  });

  it('New Feature button should invoke New Feature Modal', function () {
    utils.click(careLandingPage.creatCTButton);
    utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
    utils.expectIsDisplayed(careFeatureLandingPage.createVirtualAssistantTemplateButton);
  });

  it('Choose Virtual Assistant', function () {
    utils.click(careFeatureLandingPage.createVirtualAssistantTemplateButton);
    utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
    utils.expectIsDisplayed(careFeatureLandingPage.createCustomerVirtualAssistantTemplateButton);
    utils.expectIsDisplayed(careFeatureLandingPage.createExpertVirtualAssistantTemplateButton);
  });

  it('Start Creating Expert Virtual Assistant', function () {
    utils.click(careFeatureLandingPage.createExpertVirtualAssistantTemplateButton);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
  });

  it('Create: Finally Move to Summary Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.finishBtn);
  });

  it('Create: Save/Finish', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.finishBtn);
  });
});

