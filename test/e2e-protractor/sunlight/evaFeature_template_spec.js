'use strict';

describe('EVA feature setup', function () {
  var evaTestName = 'e2e-expertVirtualAssistant-' + utils.randomId();
  var evaTestRename = evaTestName + '-NewName';
  var evaTestInvalidEmailPrefix = 'a@b';
  var evaTestEmailPrefix = 'e2e-expertVirtualAssistant-' + utils.randomId();
  var defaultSpaceName = 'Expert Virtual Assistant Default Space';

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

  it('Start Creating Expert Virtual Assistant: empty page', function () {
    utils.click(careFeatureLandingPage.createExpertVirtualAssistantTemplateButton);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);


    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
  });

  it('Create: Name page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    var expectedHint = 'Specify the name Cisco Spark users in your organization see when they interact with your Expert Virtual Assistant in expert spaces.';
    utils.waitForText(careVirtualAssistantTemplateSetupPage.nameHint, expectedHint);
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

  it('Create: Avatar page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarUpload);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Create: default space page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    // Choose one of the drop down, then right button should be enabled
    utils.click(careVirtualAssistantTemplateSetupPage.defaultSpaceDropDown);
    utils.click(careVirtualAssistantTemplateSetupPage.defaultSpaceDropDown.all(by.cssContainingText('li', defaultSpaceName)).first());
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Create: required configuration page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Create: Finally Move to Summary Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.finishBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.editWarning);
  });

  it('Create: Save/Finish', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.finishBtn);
    notifications.assertSuccess('You have successfully created ' + evaTestName + '.');
  });

  it('Find created EVA', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestName);
    utils.waitForText(careLandingPage.foundCardName, evaTestName);
  });

  it('Start Editing EVA.', function () {
    utils.click(careLandingPage.editCardBtnOnCard);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Move to name page and rename', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.name);
    utils.expectValueToContain(careVirtualAssistantTemplateSetupPage.name, evaTestName);

    utils.clear(careVirtualAssistantTemplateSetupPage.name);
    utils.sendKeys(careVirtualAssistantTemplateSetupPage.name, evaTestRename);
  });

  it('Edit: Move to Email page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisabled(careVirtualAssistantTemplateSetupPage.email);
    utils.expectValueToContain(careVirtualAssistantTemplateSetupPage.email, evaTestEmailPrefix);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.disabledEmailExtension);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.errorMessage);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Move to Avatar Upload Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.avatarPreview);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Move to default space page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.titleDesc);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Move to required configuration page', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.title);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
  });

  it('Edit: Finally Move to Summary Modal', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.setUpRightBtn);

    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.setUpLeftBtn);
    utils.expectIsNotDisplayed(careVirtualAssistantTemplateSetupPage.setUpRightBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.finishBtn);
    utils.expectIsDisplayed(careVirtualAssistantTemplateSetupPage.editWarning);
  });

  it('Edit: Save/Finish', function () {
    utils.click(careVirtualAssistantTemplateSetupPage.finishBtn);
    notifications.assertSuccess('Changes to ' + evaTestRename + ' are successfully saved.');
  });

  it('Find edited template', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestRename);
    utils.waitForText(careLandingPage.foundCardName, evaTestRename);
  });
  it('Delete EVA', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestRename);
    utils.waitForText(careLandingPage.foundCardName, evaTestRename);
    utils.click(careLandingPage.deleteCardBtnOnCard);
    utils.click(careLandingPage.deleteTemplateOnModal);
    notifications.assertSuccess(evaTestRename + ' has been deleted successfully.');
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, evaTestRename);
    utils.expectIsNotDisplayed(careChatTemplateSetupPage.chatTemplateName);
  });
});

