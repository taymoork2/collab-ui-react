'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */

describe('Configuring Contact Center services per user', function () {
  // We need to use an existing user since only they will have an activated profile'
  var testUser = 'kabru.sikkim@outlook.com';
  var userAlias = "SunlightE2EUserAlias";

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('contactcenter-admin', '#/users');
  });

  it('should toggle media channel for the user and update alias, Role and then save', function () {
    utils.clickUser(testUser);
    utils.expectIsDisplayed(users.contactCenterService);
    utils.click(users.contactCenterService);
    utils.expectIsDisplayed(users.sunlightUserPanel);
    utils.waitForTextBoxValue(users.sunlightUserAlias);
    utils.click(users.sunlightChatChannel);
    utils.click(users.sunlightEmailChannel);
    utils.click(users.sunlightVoiceChannel);
    utils.clear(users.sunlightUserAlias);
    utils.sendKeys(users.sunlightUserAlias, userAlias);
    utils.click(users.sunlightUserRole);
    utils.click(users.sunlightUserRoleFirstElement);
    utils.click(users.sunlightUserOverviewSave);
    notifications.assertSuccess('Information is successfully saved for ' + testUser);
    utils.click(users.closeSidePanel);
  });

});
