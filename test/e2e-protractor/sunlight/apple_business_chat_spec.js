describe('Apple Business Chat', () => {
  const ABCTestName = 'e2e-AppleBusinessChat- ' + utils.randomId();

  beforeAll(function () {
    login.login('expertvirtualassistant-admin', '#/services');
  });

  it('should go to Care Features page', function () {
    utils.expectIsDisplayed(careLandingPage.careFeature);
    utils.click(careLandingPage.careFeature);
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
  });

  describe('Create', () => {
    it('should open New Feature Modal when New button is clicked', function () {
      utils.click(careLandingPage.creatCTButton);
      utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
      utils.expectIsDisplayed(careFeatureLandingPage.createVirtualAssistantTemplateButton);
    });

    it('should display Business Id page when Apple Business Chat is selected', function () {
      utils.click(careFeatureLandingPage.createAppleBusinessChatButton);
      utils.expectIsNotDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
      utils.sendKeys(careAppleBusinessChatPage.businessId, 'ABC_ID');
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
    });

    it('should proceed to Name page', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      const expectedHint = 'Specify the Apple Business Chat name';
      utils.waitForText(careAppleBusinessChatPage.nameHint, expectedHint);
      utils.sendKeys(careAppleBusinessChatPage.name, ABCTestName);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
    });

    it('should display list of Customer Virtual Assistants', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpDesc);
      utils.expectIsDisplayed(careAppleBusinessChatPage.cvaDropdown);
    });

    it('should proceed to Summary page', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsNotDisplayed(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.finishBtn);
    });

    it('should successfully create', () => {
      utils.click(careAppleBusinessChatPage.finishBtn);
      notifications.assertSuccess('You have successfully created ' + ABCTestName + '.');
    });
  });

  describe('Search', () => {
    it('should find created ABC', () => {
      utils.click(utils.searchbox);
      utils.clear(utils.searchField);
      utils.sendKeys(utils.searchField, ABCTestName);
      utils.waitForText(careLandingPage.foundCardName, ABCTestName);
    });
  });

  describe('Delete', () => {
    it('should delete ABC', function () {
      utils.click(careLandingPage.deleteCardBtnOnCard);
      utils.click(careLandingPage.deleteTemplateOnModal);
      notifications.assertSuccess(ABCTestName + ' has been deleted successfully.');
      utils.click(utils.searchbox);
      utils.clear(utils.searchField);
      utils.sendKeys(utils.searchField, ABCTestName);
      utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
    });
  });
});
