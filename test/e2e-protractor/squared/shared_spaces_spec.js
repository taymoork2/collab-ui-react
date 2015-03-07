'use strict';
/*jshint loopfunc: true */

/* global describe, it, browser, expect, login, spaces, navigation, utils, notifications */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Devices flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as squared team member admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on devices tab should show the list of rooms', function () {
    navigation.clickDevices();
    utils.expectIsDisplayed(spaces.roomsList);
  });

  it('clicking on add room button should be successful', function () {
    utils.click(spaces.addButton);
    utils.expectIsDisplayed(spaces.addRoomDialog);
    utils.expectIsDisplayed(spaces.addRoomButton);
  });

  it('entering a new room should add the room successfully', function () {
    var testRoom = utils.randomTestRoom();
    spaces.newRoomField.clear();
    spaces.newRoomField.sendKeys(testRoom);
    utils.click(spaces.addRoomButton);
    utils.expectIsDisplayed(spaces.deviceCard);
    notifications.assertSuccess('added successfully');
    utils.click(spaces.deviceModalClose);
    utils.expectIsNotDisplayed(spaces.addRoomDialog);
  });

  it('should delete device', function () {
    utils.click(spaces.actionLink);
    utils.click(spaces.deleteDeviceAction);
    utils.expectIsDisplayed(spaces.deleteDeviceModal);
    utils.click(spaces.deleteButton);
    notifications.assertSuccess('deleted successfully');
  });

  it('should log out', function () {
    navigation.logout();
  });
});
