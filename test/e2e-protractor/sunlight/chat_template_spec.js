'use strict';

describe('Care admin should be able to', function () {

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


  it('create a chat template, assert chat template is listed, edit chat template and delete a chat template', function () {
    createTemplateAndValidate();
    validateContentsOfSummaryPage(careChatTemplateSetupPage.randomChatTemplateName + ' chat template has been created successfully');
    validateDismissOfCTSetupWizard();
    validateDisplayEmbedCodeModal();
    validateDismissOfEmbedCodeModal();
    validateFeaturesPage("");
    editTemplateAndValidate("edit");
    validateContentsOfSummaryPage(careChatTemplateSetupPage.randomChatTemplateName + 'edit chat template has been updated successfully');
    validateDismissOfCTSetupWizard();
    validateDisplayEmbedCodeModal();
    validateDismissOfEmbedCodeModal();
    validateFeaturesPage("edit");
    deleteTemplate(careChatTemplateSetupPage.randomChatTemplateName + "edit");
  });

  function createTemplateAndValidate() {
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
    utils.click(careLandingPage.creatCTButton);
    validateDisplayNewFeatureModal();
    utils.click(careChatTemplateSetupPage.createChatTemplateButton);
    utils.expectIsDisplayed(careChatTemplateSetupPage.ctNameInput);
    utils.expectTextToBeSet(careChatTemplateSetupPage.nameHint, "Enter a name for you to identify this chat template");
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
    utils.sendKeys(careChatTemplateSetupPage.ctNameInput, careChatTemplateSetupPage.randomChatTemplateName);
    fillTemplateValues(true);
  }

  function validateDisplayNewFeatureModal() {
    utils.expectIsDisplayed(careChatTemplateSetupPage.careNewFeatureModal);
    utils.expectIsDisplayed(careChatTemplateSetupPage.createChatTemplateButton);
   }

  function editTemplateAndValidate(templateNameSuffix) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectTextToBeSet(careChatTemplateSetupPage.chatTemplateName, careChatTemplateSetupPage.randomChatTemplateName);
    utils.click(careChatTemplateSetupPage.editChatTemplateBtnOnCard);
    utils.expectIsDisplayed(careChatTemplateSetupPage.ctNameInput);
    utils.expectTextToBeSet(careChatTemplateSetupPage.nameHint, "Enter a name for you to identify this chat template");
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
    utils.sendKeys(careChatTemplateSetupPage.ctNameInput, templateNameSuffix);
    fillTemplateValues(false);
  }

  function fillTemplateValues(createTemplateFlag) {
    if (createTemplateFlag) {
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfOverviewPage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfCustomerInfoPage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfAgentUnavailablePage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfOffHoursPage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfFeedbackPage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfProfilePage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      validateContentsOfChatStatusMessagesPage();
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
    } else {
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
      utils.click(careChatTemplateSetupPage.setUpRightBtn);
    }
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
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpTitle, expectedTitle);
    validateDesc(expectedDesc)
  }

  function validateDesc(expectedDesc) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpDesc, expectedDesc);
  }

  function validateOverviewTitleAndDesc(expectedTitle, expectedDesc) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.overviewCardTitle, expectedTitle);
    validateOverviewDesc(expectedDesc)
  }

  function validateOverviewDesc(expectedDesc) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.overviewCardDesc, expectedDesc);
  }


  function validateContentsOfProfilePage() {
    validateTitleAndDesc('Chat Template Profile', 'Configure how you want the organization and user profile to be represented for your company');
    utils.expectIsReadOnly(careChatTemplateSetupPage.OrgName);
    utils.click(careChatTemplateSetupPage.agentProfile);
    utils.expectIsDisplayed(careChatTemplateSetupPage.agentDisplayImage);
    utils.click(careChatTemplateSetupPage.agentNameRadio);
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentNamePreview, 'Agent');
    utils.click(careChatTemplateSetupPage.agentAliasRadio);
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentNamePreview, 'Alias');
    utils.expectIsDisplayed(careChatTemplateSetupPage.agentPreviewIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewMinimizeIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewCloseIcon);
  }

  function validateContentsOfOverviewPage() {
    var OVERVIEW_CARD_COUNT = 4;
    validateOverviewTitleAndDesc('Chat Template Overview', 'Toggle cards to customize what screens you want your customer to see on contacting Care');
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoDisabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.expectCount(careChatTemplateSetupPage.overviewCard, OVERVIEW_CARD_COUNT)
  }

  function validateContentsOfCustomerInfoPage() {
    validateTitleAndDesc('Customer Info Screen', 'This is the screen a customer fills in to start chat with an agent');
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

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, "Custom Welcome Msq");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_Header_Welcome, "Custom Welcome Msq");

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, "OrgName1");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_Header_Org, "OrgName1");
  }

  function validateField1Change() {
    utils.click(careChatTemplateSetupPage.customerInfo_screen_div1);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField3);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, "Custom Label");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_screen_field1Label, "Custom Label");

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, "Custom HintText");

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
  }

  function validateField2Change() {
    utils.click(careChatTemplateSetupPage.customerInfo_screen_div2);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField3);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField1, "Custom Label");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_screen_field1Label, "Custom Label");

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, "Custom HintText");

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
  }

  function validateContentsOfFeedbackPage() {
    validateTitleAndDesc('Feedback Screen', 'This screen is used to collect feedback from a customer after the chat ends');
    utils.expectIsDisabled(careChatTemplateSetupPage.templatePreviewTextField);
  }

  function validateContentsOfAgentUnavailablePage() {
    validateTitleAndDesc('Agent Unavailable', 'This screen is shown to a customer when no agent is available to assist');
    utils.expectValueToBeSet(careChatTemplateSetupPage.agentUnavailableMessageField, "Sorry, we are unavailable at the moment. Please try again later.");
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentUnavailableMessage, "Sorry, we are unavailable at the moment. Please try again later.");
    utils.sendKeys(careChatTemplateSetupPage.agentUnavailableMessageField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectValueToBeSet(careChatTemplateSetupPage.agentUnavailableMessageField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentUnavailableMessage, careChatTemplateSetupPage.randomChatTemplateName);
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
    validateTitleAndDesc('Chat Status Messages', 'Configure status messages which your customer sees on chat bubble');
    validateChatStatusMessagesDefaultPage();
    validateChatStatusMessagesChange();

  }

  function validateContentsOfSummaryPage(successMessage) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.summaryDesc, 'You have configured the chat template. Click Finish to save the configuration and generate embed code so you can start using this chat template on your organization website.');
    utils.click(careChatTemplateSetupPage.chatSetupFinishBtn);
    notifications.assertSuccess(successMessage);
  }

  function validateFeaturesPage(templateNameSuffix) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName + templateNameSuffix);
    utils.expectTextToBeSet(careChatTemplateSetupPage.chatTemplateName, careChatTemplateSetupPage.randomChatTemplateName + templateNameSuffix);
    utils.expectIsDisplayed(careChatTemplateSetupPage.downloadEmbedCodeOnCard);
    utils.click(careChatTemplateSetupPage.downloadEmbedCodeOnCard);
    validateDisplayEmbedCodeModal();
  }

  function deleteTemplate(templateName) {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, templateName);
    utils.expectTextToBeSet(careChatTemplateSetupPage.chatTemplateName, templateName);
    utils.click(careChatTemplateSetupPage.deleteEmbedCodeBtnOnCard);
    utils.click(careChatTemplateSetupPage.deleteChatTemplateonModal);
    notifications.assertSuccess(templateName + ' chat template has been deleted successfully');
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, templateName);
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
  }

  function validateChatStatusMessagesDefaultPage() {
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(0), "Waiting for an Agent to join...");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(1), "Agent has entered the chat room");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(2), "Agent has left the chat room");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(3), "You are chatting with our Agent");
  }

  function validateChatStatusMessagesChange() {
    utils.sendKeys(careChatTemplateSetupPage.chatStatusMessages.get(0), " His name is Joy");
    utils.sendKeys(careChatTemplateSetupPage.chatStatusMessages.get(1), " His name is Joy");
    utils.sendKeys(careChatTemplateSetupPage.chatStatusMessages.get(2), " Good Bye");
    utils.sendKeys(careChatTemplateSetupPage.chatStatusMessages.get(3), " Cody Banks");

    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(0),
      "Waiting for an Agent to join... His name is Joy");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(1),
      "Agent has entered the chat room His name is Joy");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(2),
      "Agent has left the chat room Good Bye");
    utils.expectValueToBeSet(careChatTemplateSetupPage.chatStatusMessages.get(3),
      "You are chatting with our Agent Cody Banks");
  }

});
