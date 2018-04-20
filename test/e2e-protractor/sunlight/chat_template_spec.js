'use strict';

describe('Care admin should be able to', function () {
  var createSummaryMessage = 'You have configured the template. Click Finish to save the configuration and generate embed code so you can start using this template on your organization website.';
  var editSummaryMessage = 'You have edited the template. Click Finish to save the configuration so you can start using the new version of this template on your organization website.';
  var virtualAssistantName = 'Sprk care test1-E2E test';
  beforeAll(function () {
    login.login('contactcenter-admin', '#/services');
  });

  it('see the services page and care card with 2 links', function () {
    utils.expectIsDisplayed(careLandingPage.careCard);
    utils.expectIsDisplayed(careLandingPage.careIcon);
    utils.expectIsDisplayed(careLandingPage.careTitle);
    utils.expectIsDisplayed(careLandingPage.careFeature);
    utils.click(careLandingPage.careFeature);
  });

  it('create a chat template', function () {
    createTemplate();
  });

  it('validate overview page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfOverviewPage();
  });

  it('validate proactive prompt page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfProactivePromptPage();
  });

  it('validate customer info page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfCustomerInfoPage();
  });

  it('validate virtual assistant page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfVirtualAssistantPage();
  });

  it('validate agent unavailable page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfAgentUnavailablePage();
  });

  it('validate off hours page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfOffHoursPage();
  });

  it('validate feedback page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfFeedbackPage();
  });

  it('validate profile page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfProfilePage();
  });

  it('validate chat status message page', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfChatStatusMessagesPage();
  });

  it('validate create save', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfSummaryPage('You have successfully created ' + careChatTemplateSetupPage.randomChatTemplateName + '.', createSummaryMessage);
    validateDismissOfCTSetupWizard();
    validateDisplayEmbedCodeModal();
    validateDismissOfEmbedCodeModal();
    validateFeaturesPage('');
  });

  it('edit chat template', function () {
    editTemplate('edit');
  });

  it('validate edit save', function () {
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfSummaryPage('Changes to ' + careChatTemplateSetupPage.randomChatTemplateName + 'edit are successfully saved.', editSummaryMessage);
    validateDismissOfCTSetupWizard();
    validateDisplayEmbedCodeModal();
    validateDismissOfEmbedCodeModal();
    validateFeaturesPage('edit');
  });

  it('delete a chat template', function () {
    deleteTemplate(careChatTemplateSetupPage.randomChatTemplateName + 'edit');
  });

  function createTemplate() {
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
    utils.click(careLandingPage.creatCTButton);
    validateDisplayNewFeatureModal();
    utils.click(careFeatureLandingPage.createCustomerSupportTemplateButton);
    validateDisplayCustomerSupportTemplateModal();
    utils.click(careFeatureLandingPage.createChatTemplateButton);
    utils.expectIsDisplayed(careChatTemplateSetupPage.ctNameInput);
    utils.waitForText(careChatTemplateSetupPage.nameHint, 'Enter a name for you to identify this template');
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
    utils.sendKeys(careChatTemplateSetupPage.ctNameInput, careChatTemplateSetupPage.randomChatTemplateName);
  }

  function validateDisplayNewFeatureModal() {
    utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
    utils.expectIsDisplayed(careFeatureLandingPage.createCustomerSupportTemplateButton);
  }

  function validateDisplayCustomerSupportTemplateModal() {
    utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
    utils.expectIsDisplayed(careFeatureLandingPage.createChatTemplateButton);
    utils.expectIsDisplayed(careFeatureLandingPage.createCallbackTemplateButton);
    utils.expectIsDisplayed(careFeatureLandingPage.createChatPlusCallbackTemplateButton);
  }

  function editTemplate(templateNameSuffix) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.waitForText(careLandingPage.foundCardName, careChatTemplateSetupPage.randomChatTemplateName);
    utils.click(careLandingPage.editCardBtnOnCard);
    utils.expectIsDisplayed(careChatTemplateSetupPage.ctNameInput);
    utils.waitForText(careChatTemplateSetupPage.nameHint, 'Enter a name for you to identify this template');
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
    utils.sendKeys(careChatTemplateSetupPage.ctNameInput, templateNameSuffix);

    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
  }

  function validateDismissOfCTSetupWizard() {
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.careChatSetupWizard);
  }

  function validateDisplayEmbedCodeModal() {
    utils.expectIsDisplayed(careChatTemplateSetupPage.embedCodeModal);
    utils.expectIsDisplayed(careChatTemplateSetupPage.copyEmbedScriptBtn);
    utils.click(careChatTemplateSetupPage.closeEmbedScriptModel);
  }

  function validateDismissOfEmbedCodeModal() {
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.embedCodeModal)
  }

  function validateTitleAndDesc(expectedTitle, expectedDesc) {
    utils.waitForText(careChatTemplateSetupPage.setUpTitle, expectedTitle);
    validateDesc(expectedDesc)
  }

  function validateDesc(expectedDesc) {
    utils.waitForText(careChatTemplateSetupPage.setUpDesc, expectedDesc);
  }

  function validateOverviewTitleAndDesc(expectedTitle, expectedDesc) {
    utils.waitForText(careChatTemplateSetupPage.overviewCardTitle, expectedTitle);
    validateOverviewDesc(expectedDesc)
  }

  function validateOverviewDesc(expectedDesc) {
    utils.waitForText(careChatTemplateSetupPage.overviewCardDesc, expectedDesc);
  }


  function validateContentsOfProfilePage() {
    validateTitleAndDesc('Branding and Identity', 'Configure how your company or your agent is visually represented');
    utils.waitForText(careChatTemplateSetupPage.profileInfoMsg, 'You can change the organization logo on the Settings page');
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.botAgentToggle);
    utils.click(careChatTemplateSetupPage.agentProfile);
    utils.waitForText(careChatTemplateSetupPage.namePreview, virtualAssistantName);
    utils.expectIsDisplayed(careChatTemplateSetupPage.botPreviewIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.botAgentToggle);
    utils.click(careChatTemplateSetupPage.agentNameRadio);
    utils.click(careChatTemplateSetupPage.agentToggle);
    utils.waitForText(careChatTemplateSetupPage.namePreview, 'Agent display name');
    utils.click(careChatTemplateSetupPage.agentAliasRadio);
    utils.waitForText(careChatTemplateSetupPage.namePreview, 'Agent alias');
    utils.waitForText(careChatTemplateSetupPage.profileInfoMsg, 'You cannot change the default agent avatar seen in the Preview');
    utils.expectIsDisplayed(careChatTemplateSetupPage.agentPreviewIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewMinimizeIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewCloseIcon);
  }

  function validateContentsOfOverviewPage() {
    var OVERVIEW_CARD_COUNT = 6;
    validateOverviewTitleAndDesc('Template Overview', 'Toggle cards to customize what screens you want your customer to see when requesting a chat from customer care');
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoDisabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.click(careChatTemplateSetupPage.proactivePromptToggle);
    browser.sleep(1000)
    utils.waitUntilEnabled(careChatTemplateSetupPage.vcaEnabled);
    utils.click(careChatTemplateSetupPage.virtualAssistantToggle);
    utils.expectCount(careChatTemplateSetupPage.overviewCard, OVERVIEW_CARD_COUNT)
  }

  function validateContentsOfProactivePromptPage() {
    validateTitleAndDesc('Proactive Prompt', 'Configure how long to wait until the prompt is shown to the customer as well as what they will see on the prompt when it is shown. The proactive prompt will not pop up during off hours and when no agents are available to assist.');
    utils.click(careChatTemplateSetupPage.promptTimeDropDown);
    utils.click(careChatTemplateSetupPage.selectedPromptTime);
    utils.clear(careChatTemplateSetupPage.promptTitle);
    utils.sendKeys(careChatTemplateSetupPage.promptTitle, careChatTemplateSetupPage.testOrgName);
    utils.expectValueToBeSet(careChatTemplateSetupPage.promptTitle, careChatTemplateSetupPage.testOrgName);
    utils.clear(careChatTemplateSetupPage.promptMessage);
    utils.sendKeys(careChatTemplateSetupPage.promptMessage, 'Chat with our solution specialists to help serve you better.');
    utils.expectValueToBeSet(careChatTemplateSetupPage.promptMessage, 'Chat with our solution specialists to help serve you better.');
  }

  function validateContentsOfCustomerInfoPage() {
    validateTitleAndDesc('Customer Information', 'This is the screen a customer fills in to start chat with an agent');
    validateCustomerInfoDefaultPage();
    validateHeaderChange();
    validateField1Change();
    validateField2Change();
  }

  function validateCustomerInfoDefaultPage() {
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_Header_Welcome);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_Header_Org);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional3);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_default_Content);
    utils.expectIsDisabled(careChatTemplateSetupPage.templatePreviewTextField);
  }

  function validateHeaderChange() {
    utils.click(careChatTemplateSetupPage.customerInfo_Header_Welcome);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, 'Custom Welcome Msq');
    utils.waitForText(careChatTemplateSetupPage.customerInfo_Header_Welcome, 'Custom Welcome Msq');

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, 'OrgName1');
    utils.waitForText(careChatTemplateSetupPage.customerInfo_Header_Org, 'OrgName1');
  }

  function validateField1Change() {
    utils.click(careChatTemplateSetupPage.customerInfo_screen_div1);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField3);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, 'Custom Label');
    utils.waitForText(careChatTemplateSetupPage.customerInfo_screen_field1Label, 'Custom Label');

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, 'Custom HintText');

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
  }

  function validateField2Change() {
    utils.click(careChatTemplateSetupPage.customerInfo_screen_div2);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField3);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, 'Custom Label');
    utils.waitForText(careChatTemplateSetupPage.customerInfo_screen_field1Label, 'Custom Label');

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, 'Custom HintText');

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
  }

  function validateContentsOfVirtualAssistantPage() {
    validateTitleAndDesc('Customer Virtual Assistant', 'Select a preconfigured Customer Virtual Assistant who provides initial automated support in your customer chat experience');
    var defaultWelcomeMsg = 'Hello, how can I help you today?';
    utils.expectValueToBeSet(careChatTemplateSetupPage.botWelcomeMessage, defaultWelcomeMsg);
    utils.waitForText(careChatTemplateSetupPage.botWelcomeMessagePreview, defaultWelcomeMsg);
    utils.clear(careChatTemplateSetupPage.botWelcomeMessage);
    var testMsg = 'test welcome message';
    utils.sendKeys(careChatTemplateSetupPage.botWelcomeMessage, testMsg);
    utils.waitForText(careChatTemplateSetupPage.botWelcomeMessagePreview, testMsg);
    utils.waitForText(careChatTemplateSetupPage.botNamePreview, virtualAssistantName);
    utils.expectIsDisplayed(careChatTemplateSetupPage.botPreviewIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewMinimizeIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewCloseIcon);
  }

  function validateContentsOfFeedbackPage() {
    validateTitleAndDesc('Feedback', 'This screen is used to collect feedback from a customer after the chat ends');
    utils.expectIsDisabled(careChatTemplateSetupPage.templatePreviewTextField);
  }

  function validateContentsOfAgentUnavailablePage() {
    validateTitleAndDesc('Agent Unavailable', 'This screen is shown to a customer when no agent is available to assist');
    utils.expectValueToBeSet(careChatTemplateSetupPage.agentUnavailableMessageField, 'Sorry, we are unavailable at the moment. Please try again later.');
    utils.waitForText(careChatTemplateSetupPage.agentUnavailableMessage, 'Sorry, we are unavailable at the moment. Please try again later.');
    utils.sendKeys(careChatTemplateSetupPage.agentUnavailableMessageField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectValueToBeSet(careChatTemplateSetupPage.agentUnavailableMessageField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.waitForText(careChatTemplateSetupPage.agentUnavailableMessage, careChatTemplateSetupPage.randomChatTemplateName);
  }

  function validateContentsOfOffHoursPage() {
    validateTitleAndDesc('Off-Hours', 'This screen is shown to a customer during business off-hours');
    utils.clear(careChatTemplateSetupPage.offHoursMessage);
    utils.sendKeys(careChatTemplateSetupPage.offHoursMessage, 'We are currently offline, please try during our business hours.');
    utils.expectIsDisplayed(careChatTemplateSetupPage.days);
    utils.click(careChatTemplateSetupPage.wednesday);
    utils.expectIsDisplayed(careChatTemplateSetupPage.open24Hours);
    utils.click(careChatTemplateSetupPage.open24Hours);
    utils.expectIsDisplayed(careChatTemplateSetupPage.timePicker);
    utils.click(careChatTemplateSetupPage.startTimeDropDown);
    utils.click(careChatTemplateSetupPage.startTime);
    utils.click(careChatTemplateSetupPage.endTimeDropDown);
    utils.click(careChatTemplateSetupPage.endTime);
    utils.click(careChatTemplateSetupPage.timezonePicker);
    utils.clear(careChatTemplateSetupPage.timezoneInput);
    utils.sendKeys(careChatTemplateSetupPage.timezoneInput, 'New_York');
    utils.click(careChatTemplateSetupPage.selectATimezone);
  }

  function validateContentsOfChatStatusMessagesPage() {
    validateTitleAndDesc('Status Messages', 'Configure the status message to display in the customer chat window');
    validateChatStatusMessagesDefaultPage();
    validateChatStatusMessagesChange();
    /* TODO
    Preview is currently part of new route.
    Uncomment the below function call once we completely move to the new route and test the preview flow.
    validateChatMessagePreviewPage();
    validateChatMessagePreviewPageOnFocusChange();
    */
  }

  function validateContentsOfSummaryPage(successMessage, expectedMessage) {
    utils.waitForText(careChatTemplateSetupPage.summaryDesc, expectedMessage);
    utils.click(careChatTemplateSetupPage.chatSetupFinishBtn);
    notifications.assertSuccess(successMessage);
  }

  function validateFeaturesPage(templateNameSuffix) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName + templateNameSuffix);
    utils.waitForText(careChatTemplateSetupPage.chatTemplateName, careChatTemplateSetupPage.randomChatTemplateName + templateNameSuffix);
    utils.expectIsDisplayed(careChatTemplateSetupPage.downloadEmbedCodeOnCard);
    utils.click(careChatTemplateSetupPage.downloadEmbedCodeOnCard);
    validateDisplayEmbedCodeModal();
  }

  function deleteTemplate(templateName) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, templateName);
    utils.waitForText(careLandingPage.foundCardName, templateName);
    utils.click(careLandingPage.deleteCardBtnOnCard);
    utils.click(careLandingPage.deleteTemplateOnModal);
    notifications.assertSuccess(templateName + ' has been deleted successfully.');
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, templateName);
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
  }

  function validateChatStatusMessagesDefaultPage() {
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(0), 'Waiting for an Agent...');
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(1), 'Chat in progress...');
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(2), 'Agent has left the chat');
  }

  function validateChatStatusMessagesChange() {
    _.times(3, function (i) {
      utils.expectIsEnabled(careChatTemplateSetupPage.chatStatusMessages.get(i));
    });
  }

  /* TODO
  Uncomment the below code once preview is included in the main route code and we completely move to it.
  For now it's only there in new route.
  function validateChatMessagePreviewPage() {
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusPreviewMessage, 'Waiting for an Agent...');
  }

  function validateChatMessagePreviewPageOnFocusChange() {
    utils.click(careChatTemplateSetupPage.chatStatusMessages.get(1));
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusPreviewMessage, 'Chat in progress...');
  }
  */
});
