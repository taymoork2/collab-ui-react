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

describe('Org Entitlement flow', function() {
  it('should login as non-sso admin user', function(){
    login.login(testuser.username, testuser.password);
  });

  it('clicking on users tab should change the view', function() {
    navigation.clickUsers();
  });

  it('should display conversations panel', function() {
    users.search(testuser.searchStr, 20);
    expect(users.resultUsername.getText()).toContain(testuser.searchStr);
    users.resultUsername.click();
    expect(users.squaredPanel.isDisplayed()).toBeTruthy();
    expect(users.huronPanel.isDisplayed()).toBeFalsy();
    expect(users.conferencePanel.isDisplayed()).toBeFalsy();
    expect(users.endpointPanel.isDisplayed()).toBeFalsy();
  });

  it('should log out', function() {
    navigation.logout();
  });
});
