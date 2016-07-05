'use strict';

describe('Care admin should be able to', function () {

  beforeAll(function () {
    login.login('contactcenter-admin', '#/careDetails/features');
  });

  it('see the landing page and able to click on new btn', function () {
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
    utils.click(careLandingPage.creatCTButton);
  });

  it('create a chat template, assert chat template is listed and delete a chat template', function () {
    validateContentsOfNamePage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfProfilePage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfOverviewPage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfCustomerInfoPage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfFeedbackPage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfAgentUnavailablePage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfOffHoursPage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfChatStringsPage();
    utils.click(careChatTemplateSetupPage.setUpRightBtn);
    validateContentsOfSummaryPage();
    validateDismissOfCTSetupWizard();
    validateDisplayEmbedCodeModal();
    validateDismissOfEmbedCodeModal();
    validateFeaturesPage();
  });

  function validateDismissOfCTSetupWizard() {
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.careChatSetupWizard)
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
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpDesc, expectedDesc);
  }

  function validateDesc(expectedDesc) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpDesc, expectedDesc);
  }

  function validateContentsOfNamePage() {
    utils.expectIsDisplayed(careChatTemplateSetupPage.typeAheadInput);
    utils.expectTextToBeSet(careChatTemplateSetupPage.nameHint, "This name is for you to uniquely identify this chat template.");
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
    utils.sendKeys(careChatTemplateSetupPage.typeAheadInput, careChatTemplateSetupPage.randomChatTemplateName);
  }

  function validateContentsOfProfilePage() {
    // TODO:Refactor the tile and icon html part in other pages
    // validateTitleAndDesc('Chat Template Profile', 'Select how your company will be represented');
    utils.expectTextToBeSet(careChatTemplateSetupPage.profileTitle, 'Chat Template Profile');
    utils.expectTextToBeSet(careChatTemplateSetupPage.profileTitleDesc, 'Select how your company will be represented');
    utils.clear(careChatTemplateSetupPage.OrgName);
    utils.sendKeys(careChatTemplateSetupPage.OrgName, careChatTemplateSetupPage.testOrgName);
    utils.expectTextToBeSet(careChatTemplateSetupPage.orgNamePreview, careChatTemplateSetupPage.testOrgName);
    utils.click(careChatTemplateSetupPage.agentProfile);
    utils.expectIsDisplayed(careChatTemplateSetupPage.agentDisplayImage);
    utils.click(careChatTemplateSetupPage.agentNameRadio);
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentNamePreview, 'Agent Name');
    utils.click(careChatTemplateSetupPage.agentAliasRadio);
    utils.expectTextToBeSet(careChatTemplateSetupPage.agentNamePreview, 'Agent Alias');
    utils.expectIsDisplayed(careChatTemplateSetupPage.agentPreviewIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewMinimizeIcon);
    utils.expectIsDisplayed(careChatTemplateSetupPage.previewCloseIcon);
  }

  function validateContentsOfOverviewPage() {
    var OVERVIEW_CARD_COUNT = 4;
    validateTitleAndDesc('Chat Template Overview', 'These are the screens customers will see when they use chat to contact customer care');
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoDisabledCard);
    utils.click(careChatTemplateSetupPage.customerInfoToggle);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfoEnabledCard);
    utils.expectCount(careChatTemplateSetupPage.overviewCard, OVERVIEW_CARD_COUNT)
  }

  function validateContentsOfCustomerInfoPage() {
    validateTitleAndDesc('Customer Info Screen', 'This is the screen a customer fills out before they chat with an agent');
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
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField4);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, "Custom Label");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_screen_field1Label, "Custom Label");

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField3, "Custom HintText");

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional1);
  }

  function validateField2Change() {
    utils.click(careChatTemplateSetupPage.customerInfo_screen_div2);

    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField1);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField2);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField3);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_attCard_textField4);

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField2, "Custom Label");
    utils.expectTextToBeSet(careChatTemplateSetupPage.customerInfo_screen_field1Label, "Custom Label");

    utils.sendKeys(careChatTemplateSetupPage.customerInfo_attCard_textField3, "Custom HintText");

    utils.expectIsNotDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
    utils.click(careChatTemplateSetupPage.customerInfo_attCard_redioOptional);
    utils.expectIsDisplayed(careChatTemplateSetupPage.customerInfo_screen_optional2);
  }

  function validateContentsOfFeedbackPage() {
    validateTitleAndDesc('Feedback Screen', 'This screen is used to collect feedback from the customer after the chat ends');
  }

  function validateContentsOfAgentUnavailablePage() {
    validateTitleAndDesc('Agent Unavailable', 'This screen is shown to a customer when no agent is available to assist');
  }

  function validateContentsOfOffHoursPage() {
    validateTitleAndDesc('Off-Hours', 'This screen is shown during business off-hours');
  }

  function validateContentsOfChatStringsPage() {
    validateTitleAndDesc('Chat Strings Configuration', 'These strings appear in the UI based on different scenarios');
  }

  function validateContentsOfSummaryPage() {
    validateDesc('You have configured the chat template. Click Finish to save the configuration and generate embed code so you can start using this chat template on your organization website.');
    utils.click(careChatTemplateSetupPage.chatSetupFinishBtn);
    notifications.assertSuccess(careChatTemplateSetupPage.randomChatTemplateName + ' Chat Template has been created successfully');
  }

  function validateFeaturesPage() {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectTextToBeSet(careChatTemplateSetupPage.chatTemplateName, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectIsDisplayed(careChatTemplateSetupPage.copyEmbedCodeOnCard);
    utils.click(careChatTemplateSetupPage.deleteEmbedCodeBtnOnCard);
    utils.click(careChatTemplateSetupPage.deleteChatTemplateonModal);
    notifications.assertSuccess(careChatTemplateSetupPage.randomChatTemplateName + ' Chat Template has been deleted successfully');
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, careChatTemplateSetupPage.randomChatTemplateName);
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
  }

});
