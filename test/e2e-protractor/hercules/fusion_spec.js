'use strict';

/* global it */
/* global by */
/* global browser */
/* global element */
/* global describe */

describe('Fusion Page', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should log in as admin', function () {
    login.login('pbr-admin');
  });

  it('should navigate to the fusion page and display something', function () {
    navigation.clickFusion();
    utils.expectIsDisplayed(element(by.id('fusion-root')));
  });

  it('should log out', function () {
    navigation.logout();
  });
});
