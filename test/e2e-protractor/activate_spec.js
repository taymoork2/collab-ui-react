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

  // encrypted String for testing expired code
  // {
  //   "email": "test-sr1@wx2.example.com",
  //   "pushId": "555555",
  //   "deviceName": "My Device",
  //   "deviceId": "mydeviceid",
  //   "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25",
  // }
  var encryptedParam = 'AXQOAkBZ87qdoXV5pSGcLPhd8KXHDErUNXJ1M6QkrdhUFJdVjfR+t+gPVSH80RrZwhOto2A9K5TpkQruMDJrHssM9eDfPvJYjpLpdBA8rmDa7JOEaCJTvRCuGtdEybp1xIEwSMxPcJmoAHEEiukYwppzreOpmjdESOOTO5VizsdQMbaBTpELWktu2leoO958JsCn/4U1c0HAKCdQTaBRexjUNEz+duInvdD/ufgCgapei3j1qM07vaOuegSz7MnUErfM7toKHni1eArRVf9uLl/0JdjptG7Sm8Qe6M1gJyxZIGtmr0FDM0XC+COBUse1EbPID7ytoPx3FY9zWBh72Q==';

  it('should display without admin controls on navigation bar', function() {

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