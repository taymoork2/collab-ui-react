'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */


// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('Activate Page with encrypted params', function() {


  //TODO: Add direct calls to verify/email rest api for random email to obtain
  //      encrypted parameter string


  it('should display without admin controls on navigation bar', function() {
    // encrypted String for:
    // {
    //   "email": "test-sr1@wx2.example.com",
    //   "pushId": "555555",
    //   "deviceName": "My Device",
    //   "codeException": 200032
    // }
    var encryptedParam = 'AXQOAkBZ87qdoXV5pSGcLPhd8KXHDErUNXJ1M6QkrdhUFJdVjfR+t+gPVSH80RrZY0L+RuyT0lFdcZLJp6wFpHElZHfQmHjEZILlgAgcCMgr0V68JBCGSAOt0DPTeb52fw3kgq6UAnG5CLEVxG+JE56qkzgNLfyIvy4ZD42RNNmUB6LvguPjxWAl1CdeoFLgDFQcEApmEekPibfrIYwkSL9LjPNaGHbFPIVR9z+LKMDyIeDwMGEQjxpx4rj401+M9s2RHSapFY1srBtilYS7JR0HMhCMmqAUHdITA/LDHkQ=';

    browser.get('#/activate?eqp=' + encryptedParam);

    expect(element(by.id('logout-btn')).isDisplayed()).toBe(false);
    expect(element(by.id('icon-search')).isDisplayed()).toBe(false);
    expect(element(by.id('search-input')).isDisplayed()).toBe(false);
    expect(element(by.id('setting-bar')).isDisplayed()).toBe(false);
  });

  it('should display code expired with user email', function() {
    expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(false);
    expect(element(by.id('codeExpired')).isDisplayed()).toBe(true);
    expect(element(by.id('resendSuccess')).isDisplayed()).toBe(false);
    expect(element(by.binding('userEmail')).getText()).toContain('test-sr1@wx2.example.com');
  });

  it('should request new code when link is clicked', function() {
    element(by.id('sendCodeLink')).click().then(function() {
      expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(false);
      expect(element(by.id('codeExpired')).isDisplayed()).toBe(false);
      expect(element(by.id('resendSuccess')).isDisplayed()).toBe(true);
      expect(element(by.binding('eqp'))).not.toBe(null);
    });
  });

});