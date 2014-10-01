'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = 'fakegmuser+test@gmail.com';

// encoded adminEmail for atlasmapservice@gmail.com
var emailParams = '&forward=YWRtaW5UZXN0VXNlckB3eDIuZXhhbXBsZS5jb20&pwdResetSuccess=true';

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('Downloads Page with email parameter and reset/admin email params', function() {

  it('should display email account', function() {
    browser.get('#/downloads?email=' + testuser + emailParams);
    expect(download.account.getText()).toContain(testuser);
  });

  it('should display message only for non-mobile device', function() {
    expect(browser.driver.isElementPresent(by.id('webTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#webTxt.ng-hide'))).toBe(false);

    expect(browser.driver.isElementPresent(by.id('iosTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#iosTxt.ng-hide'))).toBe(true);

    expect(browser.driver.isElementPresent(by.id('androidTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#androidTxt.ng-hide'))).toBe(true);
  });

  it('should not display logged in user, logout link, search field, and tabs', function() {
    navigation.expectAdminSettingsDisplayed(false);
  });
  it('should have invoked send email api', function() {
    download.sendStatus.getAttribute('mailStatus').then(function(value) {
      expect(value).toBe('email success');
    });
  });
});

describe('Downloads Page with email parameter only', function() {

  it('should display email account', function() {
    browser.get('#/downloads?email=' + testuser);
    expect(download.account.getText()).toContain(testuser);
  });

  it('should not have sent any email', function() {
    download.sendStatus.getAttribute('mailStatus').then(function(value) {
      expect(value).toBe('');
    });
  });
});
