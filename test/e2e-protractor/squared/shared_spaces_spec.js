'use strict';
/*jshint loopfunc: true */

/* global describe, it, browser, expect, login, spaces, navigation, utils, notifications */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Shared spaces flow', function() {
  it('should login as squared team member admin user', function() {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on devices tab should show the list of rooms', function() {
    navigation.clickDevices();
    expect(spaces.roomsList.isDisplayed()).toBeTruthy();
    expect(spaces.addButton.isDisplayed()).toBeTruthy();
  });

  it('clicking on add room button should be successful', function() {
    spaces.addButton.click();
    utils.expectIsDisplayed(spaces.addRoomDialog);
    utils.expectIsDisplayed(spaces.addRoomButton);
  });

  it('entering a new room should add the room successfully', function() {
    var testRoom = utils.randomTestRoom();
    spaces.newRoomField.clear();
    spaces.newRoomField.sendKeys(testRoom);
    spaces.addRoomButton.click();
    utils.expectIsDisplayed(spaces.deviceCard);
    expect(spaces.confirmDeviceName.getText()).toContain(testRoom);
    notifications.assertSuccess('added successfully');
    spaces.deviceModalClose.click();
    browser.sleep(1000);
  });

  it('cancel delete device', function() {
      utils.expectIsDisplayed(spaces.actionLink);
      spaces.actionLink.click();
      utils.expectIsDisplayed(spaces.deleteDeviceAction);
      spaces.deleteDeviceAction.click();
      utils.expectIsDisplayed(spaces.deleteDeviceModal);
      spaces.cancelButton.click();
      browser.sleep(1000);
    });

  it('should delete device', function() {
      utils.expectIsDisplayed(spaces.actionLink);
      spaces.actionLink.click();
      utils.expectIsDisplayed(spaces.deleteDeviceAction);
      spaces.deleteDeviceAction.click();
      utils.expectIsDisplayed(spaces.deleteDeviceModal);
      spaces.deleteButton.click();
      notifications.assertSuccess('deleted successfully');
    });

  it('should log out', function() {
    navigation.logout();
  });
});
