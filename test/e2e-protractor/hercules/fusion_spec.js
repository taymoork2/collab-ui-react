'use strict';

/* global it */
/* global by */
/* global expect */
/* global browser */
/* global element */
/* global describe */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Fusion Page', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should log in as admin', function () {
    login.login(testuser.username, testuser.password);
  });

  it('should navigate to the fusion page and display something', function () {
    navigation.clickFusion();
    utils.expectIsDisplayed(element(by.id('fusion-root')));
  });

  it('should log out', function () {
    navigation.logout();
  });
});
