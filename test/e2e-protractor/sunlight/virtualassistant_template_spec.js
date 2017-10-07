'use strict';

describe('Care virtualassistant admin setup virtual assistant', function () {
  // NOTE: these variables will only be saved AFTER DELETE is implemented in the page
  var APIAITestClientToken = '22e724e0bc604e99b0cfd281cd6c282a';
  var APIAITestAgentName = 'e2e-careVirtualAssistantTemplate-' + utils.randomId();
  var RenamedAPIAITestAgentName = APIAITestAgentName + '-NewName';
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

  it('Start Creating Customer VirtualAssistant', function () {
    utils.click(careFeatureLandingPage.createCustomerVirtualAssistantTemplateButton);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.apiaiIsNotPreconfigured);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.apiaiIsPreconfigured);
    // set apiai as preconfigured
    utils.click(careVirtualAssistantTemplateSetupPage.apiaiIsPreconfigured);
  });

  it('Create: Indicate API.AI is Configured and move to DialogIntegeration Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.downloadEscalationIntentBtn);
  });

  it('Create: Move to Client Access Token Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.apiaiClientAccessToken);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.apiaiClientAccessToken, APIAITestClientToken);

    utils.click(careVirtualAssistantTemplateSetupPage.validateBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.checkMarkIcon);
  });

  it('Create: Move to Naming Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.name);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, APIAITestAgentName);
  });

  it('Create: Move to Avatar Upload Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarUpload);
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
    notifications.assertSuccess('You have successfully created ' + APIAITestAgentName + '.');
  });

  it('Find created Template', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, APIAITestAgentName);
    utils.waitForText(careLandingPage.foundCardName, APIAITestAgentName);
  });
  it('Start Editing VirtualAssistant Template.', function () {
    utils.click(careLandingPage.editCardBtnOnCard);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });
  it('Edit: Indicate API.AI is Configured and move to DialogIntegeration Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.downloadEscalationIntentBtn);
  });

  it('Edit: Move to Client Access Token Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.apiaiClientAccessToken);

    utils.click(careVirtualAssistantTemplateSetupPage.validateBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.checkMarkIcon);
  });

  it('Edit: Move to Naming Modal; rename', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.name);

    utils.clear(careVirtualAssistantTemplateSetupPage.name);
    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, RenamedAPIAITestAgentName);
  });

  it('Edit: Move to Avatar Upload Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarPreview);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Finally Move to Summary Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.finishBtn);
  });

  it('Edit: Save/Finish', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.finishBtn);
    notifications.assertSuccess('You have successfully updated ' + RenamedAPIAITestAgentName + '.');
  });

  it('Find edited template', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, RenamedAPIAITestAgentName);
    utils.waitForText(careLandingPage.foundCardName, RenamedAPIAITestAgentName);
  });

  it('Delete: Edited template', function () {
    utils.click(careLandingPage.deleteCardBtnOnCard);
    utils.click(careLandingPage.deleteTemplateOnModal);
    notifications.assertSuccess(RenamedAPIAITestAgentName + ' has been deleted successfully.');
  });

  it('Validate non of our created or edit templates exist anymore', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, RenamedAPIAITestAgentName);
    utils.expectIsNotDisplayed(careLandingPage.foundCardName);

    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, APIAITestAgentName);
    utils.expectIsNotDisplayed(careLandingPage.foundCardName);
  });
});

