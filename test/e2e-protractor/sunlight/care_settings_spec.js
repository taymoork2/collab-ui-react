'use strict';

// Unstable test, see https://jira-eng-sjc12.cisco.com/jira/browse/SL-1580
xdescribe('On Care settings page, a Care admin should be able to ', function () {
  beforeAll(function () {
    login.login('contactcenter-admin', '#/services/careDetails/settings');
  });

  it('load care settings page', function () {
    utils.expectIsDisplayed(careSettingsPage.pickRouting);
    utils.expectIsDisplayed(careSettingsPage.pushRouting);
    utils.expectIsDisplayed(careSettingsPage.chatCount);
    utils.expectIsDisplayed(careSettingsPage.chatToVideoToggle);
  });

  it('load settings with default values for org chat configurations', function () {
    utils.isSelected(careSettingsPage.pickRouting);
    utils.expectText(careSettingsPage.chatCount, 5);
    utils.isSelected(careSettingsPage.chatToVideoToggle);
  });

  it('save the org chat configurations', function () {
    toggleChatCount();
    validateSubmitConfiguration();
  });

  function toggleChatCount() {
    element(by.css('.settings.care-settings .selectedChatCount span.select-toggle')).click();
    element(by.cssContainingText('.settings.care-settings .selectedChatCount .select-options a', '4')).click();
    browser.executeScript("$('.sidenav-page-content-wrapper').scrollTop(1000);");
    element(by.css('.settings.care-settings .selectedChatCount span.select-toggle')).click();
    element(by.cssContainingText('.settings.care-settings .selectedChatCount .select-options a', '5')).click();
  }

  function validateSubmitConfiguration() {
    utils.wait(careSettingsPage.careSettingsSaveButton);
    careSettingsPage.careSettingsSaveButton.click();
    utils.waitForModal().then(function () {
      utils.expectText(careSettingsPage.modalBody, 'Are you sure you want to change your care settings?');
      careSettingsPage.modalSave.click();
      notifications.assertSuccess('Care service has been setup successfully.');
    });
  }
});
