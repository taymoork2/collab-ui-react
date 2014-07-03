'use strict';

/* global describe */
/* global it */
/* global by */
/* global browser */
/* global expect */


// encrypted param from invitation email link
var pageParams = 'randomtempencryptedparam';

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('invite page with user param', function() {

  it('should forward to squared app', function() {
    browser.get('#/invite?user=' + pageParams);
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('btn-login'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('wx2-web.wbx2.com');
    });

  });

  // it('should create cookie', function() {
  //   browser.manage().getCookie('invdata').then(function(data) {
  //     console.log('cookie: ' + data);
  //     expect(data).not.toBe(null);
  //     expect(data.userEmail).toBe(pageParams);
  //   });
  // });
});