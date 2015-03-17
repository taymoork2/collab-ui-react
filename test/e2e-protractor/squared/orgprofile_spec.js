'use strict';

describe('Customer Profile Page', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as squared team member admin user', function () {
    login.login('pbr-admin');
  });

  it('should display customer profile page', function () {
    navigation.clickOrgProfile();
    utils.expectIsDisplayed(orgprofile.supportForm);
    utils.expectIsDisplayed(orgprofile.orgProfilePageTitle);
    utils.expectIsDisplayed(orgprofile.orgProfileSaveBtn);
    utils.expectIsDisplayed(orgprofile.orgProfileCancelBtn);
    utils.expectIsDisplayed(orgprofile.companyInfoPanel);
    // utils.expectIsDisplayed(orgprofile.ciscoRepPanel);
    utils.expectIsDisplayed(orgprofile.troubleReportingPanel);
    utils.expectIsDisplayed(orgprofile.troubleReportingCiscoPanel);
    utils.expectIsDisplayed(orgprofile.troubleReportingPartnerPanel);
    utils.expectIsDisplayed(orgprofile.helpPanel);
    utils.expectIsDisplayed(orgprofile.helpCiscoPanel);
    utils.expectIsDisplayed(orgprofile.helpPartnerPanel);
  });

  it('should be able to set custom supportUrl, supportText and helpUrl', function () {
    utils.click(orgprofile.troubleReportingPartnerPanelRadio);
    utils.clear(orgprofile.partnerSupportUrl);
    utils.sendKeys(orgprofile.partnerSupportUrl, 'http://www.test.com/support');
    utils.clear(orgprofile.partnerSupportText);
    utils.sendKeys(orgprofile.partnerSupportText, 'This is a custom support url');
    utils.click(orgprofile.helpPartnerPanelRadio);
    utils.clear(orgprofile.partnerHelpUrl);
    utils.sendKeys(orgprofile.partnerHelpUrl, 'http://www.test.com/help');

    utils.scrollTop();
    utils.click(orgprofile.orgProfileSaveBtn);
    notifications.assertSuccess('orgSettings updated successfully');
  });

  it('should log out', function () {
    navigation.logout();
  });
}); //State is logged-in
