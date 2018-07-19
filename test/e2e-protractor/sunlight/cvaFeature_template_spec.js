'use strict';

describe('CVA feature setup', function () {
  // NOTE: these variables will only be saved AFTER DELETE is implemented in the page
  var DialogflowTestClientToken = '22e724e0bc604e99b0cfd281cd6c282a';
  var DialogflowTestAgentName = 'e2e-customerVirtualAssistant- ' + utils.randomId();
  var RenamedDialogflowTestAgentName = DialogflowTestAgentName + '-NewName';
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
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowIsNotPreconfigured);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowIsPreconfigured);
    // set dialogflow as preconfigured
    utils.click(careVirtualAssistantTemplateSetupPage.dialogflowIsPreconfigured);
  });

  it('Create: Indicate Dialogflow is Configured and move to DialogIntegeration Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.downloadEscalationIntentBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.warningMessage);
  });

  it('Create: Move to Client Access Token Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowClientAccessToken);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.dialogflowClientAccessToken, DialogflowTestClientToken);

    utils.click(careVirtualAssistantTemplateSetupPage.validateBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.checkMarkIcon);
  });

  it('Create: Move to Naming Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.name);

    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, DialogflowTestAgentName);
  });

  it('Create: Move to Avatar Upload Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarUpload);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });
  
  it('Create: Move to Dialogflow Input Context Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowInputContextForm);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowInputContextFieldInput1);
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
    notifications.assertSuccess('You have successfully created ' + DialogflowTestAgentName + '.');
  });

  it('Find created Template', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, DialogflowTestAgentName);
    utils.waitForText(careLandingPage.foundCardName, DialogflowTestAgentName);
  });
  it('Start Editing VirtualAssistant Template.', function () {
    utils.click(careLandingPage.editCardBtnOnCard);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });
  it('Edit: Indicate Dialogflow is Configured and move to DialogIntegeration Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.downloadEscalationIntentBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.warningMessage);
  });

  it('Edit: Move to Client Access Token Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowClientAccessToken);

    utils.expectIsDisabled(careVirtualAssistantTemplateSetupPage.validateBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.checkMarkIcon);
  });

  it('Edit: Move to Naming Modal; rename', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.name);

    utils.clear(careVirtualAssistantTemplateSetupPage.name);
    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, RenamedDialogflowTestAgentName);
  });

  it('Edit: Move to Avatar Upload Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarPreview);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });
  
  it('Edit: Move to Dialogflow Input Context Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowInputContextForm);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.dialogflowInputContextFieldInput1);
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
    notifications.assertSuccess('Changes to ' + RenamedDialogflowTestAgentName + ' are successfully saved.');
  });

  it('Find edited template', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, RenamedDialogflowTestAgentName);
    utils.waitForText(careLandingPage.foundCardName, RenamedDialogflowTestAgentName);
  });

  it('Delete: Edited template', function () {
    utils.click(careLandingPage.deleteCardBtnOnCard);
    utils.click(careLandingPage.deleteTemplateOnModal);
    notifications.assertSuccess(RenamedDialogflowTestAgentName + ' has been deleted successfully.');
  });

  it('Validate non of our created or edit templates exist anymore', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, RenamedDialogflowTestAgentName);
    utils.expectIsNotDisplayed(careLandingPage.foundCardName);

    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, DialogflowTestAgentName);
    utils.expectIsNotDisplayed(careLandingPage.foundCardName);
  });
});

