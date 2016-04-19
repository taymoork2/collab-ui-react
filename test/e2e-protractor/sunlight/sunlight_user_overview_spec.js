'use strict';

describe('Configuring Contact Center services per user', function () {
  // We need to use an existing user since only they will have an activated profile'
  var testUser = 'kabru.sikkim@outlook.com';
  var userAlias = "SunlightE2EUserAlias";

  xit('should login as an account admin', function () {
    login.login('contactcenter-admin', '#/users');
  });

  xit('should toggle media channel for the user and save', function () {
    utils.clickUser(testUser);
    utils.expectIsDisplayed(users.contactCenterService);
    utils.click(users.contactCenterService);
    utils.expectIsDisplayed(users.sunlightUserPanel);
    utils.waitForTextBoxValue(users.sunlightUserAlias);
    utils.click(users.sunlightChatChannel);
    utils.click(users.sunlightEmailChannel);
    utils.click(users.sunlightVoiceChannel);
    utils.click(users.sunlightUserOverviewSave);
    notifications.assertSuccess('Information has been updated successfully for user ' + testUser);
  });

  xit('should change user alias and save', function () {
    utils.clear(users.sunlightUserAlias);
    utils.sendKeys(users.sunlightUserAlias, userAlias);
    utils.click(users.sunlightUserRole);
    utils.click(users.sunlightUserOverviewSave);
    notifications.assertSuccess('Information has been updated successfully for user ' + testUser);
  });

  xit('should change user role to USER and save', function () {
    utils.click(users.sunlightUserRole);
    utils.click(users.sunlightUserRoleFirstElement);
    utils.click(users.sunlightUserOverviewSave);
    notifications.assertSuccess('Information has been updated successfully for user ' + testUser);
  });

});
