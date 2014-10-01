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

// Logging in. Write your tests after the login flow is complete.
describe('Login as squared team member admin user', function() {
  it('should login', function(){
    login.login(testuser.username, testuser.password);
  });
}); //State is logged-in

describe('Navigating to shared spaces tab', function() {
	it('clicking on shared spaces tab should show the list of rooms', function() {
		navigation.clickSharedSpaces();
    expect(spaces.roomsList.isDisplayed()).toBeTruthy();
    expect(spaces.addButton.isDisplayed()).toBeTruthy();
    expect(spaces.moreOptions.isDisplayed()).toBeTruthy();
  });
});

describe('Adding a new room', function() {
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
    users.assertSuccess('added successfully');
  });
});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    navigation.logout();
  });
});

