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
    orgprofile.partnerSupportUrl.sendKeys('http://www.test.com/support');
    orgprofile.partnerSupportText.sendKeys('This is a custom support url');
    utils.click(orgprofile.helpPartnerPanelRadio);
    orgprofile.partnerHelpUrl.sendKeys('http://www.test.com/help');
    browser.executeScript('window.scrollTo(0,0);').then(function () {
      utils.click(orgprofile.orgProfileSaveBtn);
      notifications.assertSuccess('orgSettings updated successfully');
    });
  });

  it('should log out', function () {
    navigation.logout();
  });
}); //State is logged-in
