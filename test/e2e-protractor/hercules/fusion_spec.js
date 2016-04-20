'use strict';

// Preliminary removed because old menu is replaced by new ones.
// TODO: Add proper test of those new elements
xdescribe('Fusion Page', function () {
  it('should log in as admin', function () {
    login.login('media-super-admin');
  });

  it('should navigate to the fusion page and display something', function () {
    navigation.clickFusion();
    utils.expectIsDisplayed(element(by.id('fusion-root')));
  });

  it('should log out', function () {
    navigation.logout();
  });
});
