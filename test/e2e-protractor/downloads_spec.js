'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = 'testUser@wx2.example.com';

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('Downloads Page with email parameter only', function() {

  it('should display email account', function() {
    browser.get('#/downloads?email=' + testuser);
    expect(element(by.binding('email')).getText()).toContain(testuser);
  });

  it('should display message only for non-mobile device', function() {
    expect(browser.driver.isElementPresent(by.id('webTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#webTxt.ng-hide'))).toBe(false);

    expect(browser.driver.isElementPresent(by.id('iosTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#iosTxt.ng-hide'))).toBe(true);

    expect(browser.driver.isElementPresent(by.id('androidTxt'))).toBe(true);
    expect(browser.driver.isElementPresent(by.css('#androidTxt.ng-hide'))).toBe(true);
  });

  // it('should not have sent any email', function() {
  //  expect(element(by.id('sendStatus')).getText()).toBe('');
  // });
});

describe('Downloads Page with email parameter and passwordResetSuccess=true', function() {

  it('should display email account', function() {
    browser.get('#/downloads?email=' + testuser + '&pwdResetSuccess=true');
    expect(element(by.binding('email')).getText()).toContain(testuser);
  });

  // it('should have invoked send email api', function() {
  //  expect(element(by.id('sendStatus')).getText()).toContain('email');
  // });
});
