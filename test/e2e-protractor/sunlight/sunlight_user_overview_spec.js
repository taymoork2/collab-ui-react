'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global expect */
/* global protractor */

describe('Configuring Contact Center services per user', function () {
  // We need to use an existing user since only they will have an activated profile'
  var testUser = 'kalanka.arunanchal@outlook.com'

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('contactcenter-admin', '#/users');
  });

  it('should add a user', function () {
    utils.click(users.addUsers);
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);
  });

  it('should enable/disable chat, email and voice channel for the user', function () {
    utils.searchAndClick(testUser);
    utils.click(users.contactCenterService);
    utils.click(users.sunlightChatChannel);
    utils.click(users.sunlightEmailChannel);
    utils.click(users.sunlightVoiceChannel);
    utils.click(users.sunlightUserOverviewSave);
    notifications.assertSuccess('Successfully updated the media channels for ' + testUser);
  });

})
