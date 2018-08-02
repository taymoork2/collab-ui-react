describe('Apple Business Chat', () => {
  const ABCTestName = 'e2e-AppleBusinessChat- ' + utils.randomId();
  const ABCTestRename = ABCTestName + '-NewName';
  const ABCBusinessId = 'ABC_ID_' + utils.randomId();

  beforeAll(function () {
    login.login('expertvirtualassistant-admin', '#/services');
  });

  const testCustomerVirtualAssistants = () => {
    utils.click(careAppleBusinessChatPage.setUpRightBtn);
    utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
    utils.expectIsDisplayed(careAppleBusinessChatPage.setUpDesc);

    if (careAppleBusinessChatPage.isNewPage) {
      utils.click(careAppleBusinessChatPage.toggleCvaOff);
      utils.expectIsDisplayed(careAppleBusinessChatPage.toggleCvaOn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.cvaDropdownStorage);
      utils.expectIsDisplayed(careAppleBusinessChatPage.storageUrl);
      utils.expectIsDisplayed(careAppleBusinessChatPage.storageToken);
    } else {
      utils.expectIsDisplayed(careAppleBusinessChatPage.cvaDropdown);
    }

    utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
    utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);

    if (careAppleBusinessChatPage.isNewPage) {
      utils.click(careAppleBusinessChatPage.toggleCvaOn);
    }
  };

  it('should go to Care Features page', function () {
    utils.expectIsDisplayed(careLandingPage.careFeature);
    utils.click(careLandingPage.careFeature);
    utils.expectIsDisplayed(careLandingPage.creatCTButton);
  });

  describe('Create', () => {
    it('should open New Feature Modal when New button is clicked', function () {
      utils.click(careLandingPage.creatCTButton);
      utils.expectIsDisplayed(careFeatureLandingPage.careNewFeatureModal);
      utils.expectIsDisplayed(careFeatureLandingPage.createAppleBusinessChatButton);
    });

    it('should display Business Id page when Apple Business Chat is selected', function () {
      utils.click(careFeatureLandingPage.createAppleBusinessChatButton);
      utils.expectIsNotDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
      utils.sendKeys(careAppleBusinessChatPage.businessId, ABCBusinessId);
      utils.expectIsEnabled(careAppleBusinessChatPage.businessId);
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
      testCustomerVirtualAssistants();
    });

    it('should proceed to Status Messages page', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.waitingMessage);
      utils.expectIsDisplayed(careAppleBusinessChatPage.leftChatMessage);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
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

  describe('Edit', () => {
    it('Start Editing existing Apple Business Chat', function () {
      utils.click(careLandingPage.editCardBtnOnCard);
      utils.expectIsNotDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
      utils.expectIsDisabled(careAppleBusinessChatPage.businessId);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsEnabled(careAppleBusinessChatPage.setUpRightBtn);
    });

    it('should proceed to Name page and rename', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      const expectedHint = 'Specify the Apple Business Chat name';
      utils.waitForText(careAppleBusinessChatPage.nameHint, expectedHint);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectValueToContain(careVirtualAssistantTemplateSetupPage.name, ABCTestName);

      utils.clear(careVirtualAssistantTemplateSetupPage.name);
      utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, ABCTestRename);
    });

    it('should display list of Customer Virtual Assistants', () => {
      testCustomerVirtualAssistants();
    });

    it('should proceed to Status Messages page', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.waitingMessage);
      utils.expectIsDisplayed(careAppleBusinessChatPage.leftChatMessage);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
    });

    it('should proceed to Summary page', () => {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpLeftBtn);
      utils.expectIsNotDisplayed(careAppleBusinessChatPage.setUpRightBtn);
      utils.expectIsDisplayed(careAppleBusinessChatPage.finishBtn);
    });

    it('should successfully Save/Finish', () => {
      utils.click(careAppleBusinessChatPage.finishBtn);
      notifications.assertSuccess('Changes to ' + ABCTestRename + ' are successfully saved.');
    });
  });

  describe('Delete', () => {
    it('should delete ABC', function () {
      // Find the ABC first
      utils.click(utils.searchbox);
      utils.clear(utils.searchField);
      utils.sendKeys(utils.searchField, ABCTestRename);
      utils.waitForText(careLandingPage.foundCardName, ABCTestRename);

      // Delete it
      utils.click(careLandingPage.deleteCardBtnOnCard);
      utils.click(careLandingPage.deleteTemplateOnModal);
      notifications.assertSuccess(ABCTestRename + ' has been deleted successfully.');
      utils.click(utils.searchbox);
      utils.clear(utils.searchField);
      utils.sendKeys(utils.searchField, ABCTestRename);
      utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
    });
  });

  describe('Deep launch with businessId query parameter', () => {
    it('should display Business Id page with populated businessId input field', function () {
      const businessId = '1234-5678';
      navigation.navigateTo('/services/careDetails/abcService?businessId=' + encodeURIComponent(businessId))
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpTitle);
      utils.expectValueToBeSet(careAppleBusinessChatPage.businessId, businessId);
      utils.expectIsDisabled(careAppleBusinessChatPage.businessId);
      utils.expectIsDisplayed(careAppleBusinessChatPage.setUpRightBtn);
    });

    it('should proceed to Name page', function () {
      utils.click(careAppleBusinessChatPage.setUpRightBtn);
      const expectedHint = 'Specify the Apple Business Chat name';
      utils.waitForText(careAppleBusinessChatPage.nameHint, expectedHint);
    });

    it('should successfully cancel the ABC creation wizard', function () {
      utils.click(careAppleBusinessChatPage.cancelBtn);
      utils.click(careAppleBusinessChatPage.confirmCancelBtn);
      utils.expectIsDisplayed(careLandingPage.careFeature);
    });
  });
});
