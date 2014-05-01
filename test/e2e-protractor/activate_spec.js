'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

// decoded params
var pageParams = '&pushId=xx&deviceName=';

function randomId() {
  return (Math.random() + 1).toString(36).slice(2);
}

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('Activate Page with params', function() {

  it('should display without admin controls on navigation bar', function() {
    var email = 'atlas-' + randomId() + '@wx2.example.com';
    var deviceName = 'Mike%27s%20iPhone';
    browser.get('#/activate?email=' + email + pageParams + deviceName);
    expect(element(by.id('logout-btn')).isDisplayed()).toBe(false);
    expect(element(by.id('icon-search')).isDisplayed()).toBe(false);
    expect(element(by.id('search-input')).isDisplayed()).toBe(false);
    expect(element(by.id('setting-bar')).isDisplayed()).toBe(false);
    expect(element(by.id('mobileSrcProvisionSuccess')).isPresent()).toBe(true);
  });
});
