'use strict';

describe('EVA feature setup', function () {
  // NOTE: these variables will only be saved AFTER DELETE is implemented in the page
  var evaTestName = 'e2e-careExpertVirtualAssistant-' + utils.randomId();
  var evaTestInvalidEmailPrefix = 'a@b';
  var evaTestEmailPrefix = 'e2e-careExpertVirtualAssistantTemplate-' + utils.randomId();

  beforeAll(function () {
    login.login('expertvirtualassistant-admin', '#/services');
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


    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
  });

  it('Create: Name page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, evaTestName);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Create: Email page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.email, evaTestInvalidEmailPrefix);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.invalidEmailExtension);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.errorMessage);
    utils.clear(careVirtualAssistantTemplateSetupPage.email);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.email, evaTestEmailPrefix);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.validEmailExtension);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.visibleCheckIcon);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.errorMessage);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Create: Finally Move to Summary Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.finishBtn);
  });

  it('Create: Save/Finish', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.finishBtn);
    notifications.assertSuccess('You have successfully created ' + evaTestName + '.');
  });

  it('Delete EVA', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestName);
    utils.waitForText(careLandingPage.foundCardName, evaTestName);
    utils.click(careLandingPage.deleteCardBtnOnCard);
    utils.click(careLandingPage.deleteTemplateOnModal);
    notifications.assertSuccess(evaTestName + ' has been deleted successfully.');
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestName);
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
  });
});

