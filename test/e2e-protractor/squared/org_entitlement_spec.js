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
  searchStr: 'fake'
};

describe('Org Entitlement flow', function () {
  it('should login as non-sso admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should display conversations panel', function () {
    users.search(testuser.searchStr);
    users.userListEnts.then(function (cell) {
      expect(cell[0].getText()).toContain(testuser.searchStr);
      cell[0].click();
    });
    expect(users.huronPanel.isDisplayed()).toBeFalsy();
    expect(users.conferencePanel.isDisplayed()).toBeFalsy();
    expect(users.endpointPanel.isDisplayed()).toBeFalsy();
  });

  it('should log out', function () {
    navigation.logout();
  });
});
