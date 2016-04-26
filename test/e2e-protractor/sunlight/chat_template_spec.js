'use strict';

describe('Care admin shoule be able to', function () {

  beforeAll(function () {
    login.login('contactcenter-admin', '#/careDetails/features');
  });

  it('see the landing page and able to click on new btn', function () {
    utils.expectIsDisplayed(careLandingPage.careLandingPgae);
    utils.expectIsDisplayed(careLandingPage.cccIcon);
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
    utils.click(careLandingPage.creatCTButton);
  });

  it('create a chat template', function () {
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
    validateContentsOfEmbedCodePage();
  });

  function validateTitleAndDesc(expectedTitle, expectedDesc) {
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpTitle, expectedTitle);
    utils.expectTextToBeSet(careChatTemplateSetupPage.setUpDesc, expectedDesc);
  }

  // Creating placeholder functions for testing multiple setUp assistant pages
  // these placeholder functions will be implemented in coming stories
  function validateContentsOfNamePage() {
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.setUpLeftBtn);
  }

  function validateContentsOfProfilePage() {
    validateTitleAndDesc('Chat Template Profile', 'Select how your company will be represented');
  }

  function validateContentsOfOverviewPage() {
    validateTitleAndDesc('Chat Template Overview', 'These are the screens customers will see when they use chat to contact customer care');
  }

  function validateContentsOfCustomerInfoPage() {
    validateTitleAndDesc('Customer Info Screen', 'This is the screen a customer fills out before they chat with an agent');
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

  function validateContentsOfEmbedCodePage() {
    validateTitleAndDesc('Embed Code', 'Use the embed code to add this chat template to your site');
  }

});
