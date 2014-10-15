'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Shared spaces flow', function() {
  it('should login as squared team member admin user', function() {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on shared spaces tab should show the list of rooms', function() {
    navigation.clickSharedSpaces();
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
    notifications.assertSuccess('added successfully');
  });

  it('should log out', function() {
    navigation.logout();
  });
});
