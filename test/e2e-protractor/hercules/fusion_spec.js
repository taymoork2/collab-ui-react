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

describe('Fusion Page', function() {
  it('should log in as admin', function(){
    login.login(testuser.username, testuser.password);
  });

  it('should navigate to the fusion page and display something', function() {
    navigation.manageTab.click();
    element(by.css('a[href="#fusion"]')).click();

    navigation.expectCurrentUrl('/fusion');
    expect(browser.driver.isElementPresent(by.id('fusion-root'))).toBe(true);
  });

  it('should log out', function() {
   navigation.logout();
  });
});
