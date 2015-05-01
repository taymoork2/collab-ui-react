'use strict';

/* global describe, it, expect, login */

describe('WebEx user settings', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(usersettings.testAdmin.username, usersettings.testAdmin.password);
  });

  it('click on users tab', function () {
    navigation.clickUsers();
  });

  it('should allow search and click on user', function () {
    utils.search(usersettings.testUser.username);
    users.clickOnUser();
  });

  it('should allow click on conferencing arrow', function () {
    expect(users.conferencingService.isPresent()).toBeTruthy();
    utils.click(users.conferencingService);
  });

  it('should allow click on site name', function () {
    expect(usersettings.testSiteElement.isPresent()).toBeTruthy();
    utils.click(usersettings.testSiteElement);
  });

  it('should display basic WebEx settigns page', function () {
    expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
    expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
  });

  it('should not display WebEx error page', function () {
    expect(usersettings.errorPanel.isPresent()).toBeFalsy();
  });

  it('should allow navigation to the 4th panel', function () {
    utils.click(usersettings.userPrivilegesLink);
    expect(usersettings.userPrivilegesPanel.isPresent()).toBeTruthy();
    expect(usersettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
  });

  it('should allow navigation back to the 3rd panel', function () {
    utils.clickLastBreadcrumb();
    expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
    expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
  });

  it('should not show save button without any changes', function () {
    expect(usersettings.saveButton.isPresent()).toBeFalsy();
  });

  it('should not allow save of mc AUO without mc PRO', function () {
    if (usersettings.mc.isPresent() && usersettings.mc.isDisplayed()) {
      usersettings.unSelectAllMcSessionTypeByPrefix('PRO');
      usersettings.selectAllMcSessionTypeByPrefix('AUO');
      expect(usersettings.saveButton.isDisplayed()).toBeTruthy();
      usersettings.save();
      expect(usersettings.alertError.isDisplayed()).toBeTruthy();
      usersettings.alertError.click();
    }
  });

  it('should allow save of mc AUO with mc PRO', function () {
    if (usersettings.mc.isPresent() && usersettings.mc.isDisplayed()) {
      usersettings.selectAllMcSessionTypeByPrefix('PRO');
      usersettings.selectAllMcSessionTypeByPrefix('AUO');
      expect(usersettings.saveButton.isDisplayed()).toBeTruthy();
      usersettings.save();
      expect(usersettings.alertSuccess.isDisplayed()).toBeTruthy();
      usersettings.alertSuccess.click();
    }
  });

  /** 
  it('should allow edit in 4th panel', function () {
    utils.click(usersettings.userPrivilegesLink);
    expect(usersettings.userPrivilegesPanel.isPresent()).toBeTruthy();
    expect(usersettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
  });
**/

  /**  
    it('should pause', function () {
      browser.pause();
    });
  **/

  it('should allow log out', function () {
    navigation.logout();
  });
});
