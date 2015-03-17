'use strict';
/*jshint loopfunc: true */

/* global describe, it, browser, login, spaces, navigation, utils, notifications */

describe('Devices flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  it('should login as squared team member admin user', function () {
    login.login('pbr-admin');
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
    utils.clear(spaces.newRoomField);
    utils.sendKeys(spaces.newRoomField, testRoom);
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
