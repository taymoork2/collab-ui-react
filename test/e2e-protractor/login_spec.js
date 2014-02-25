'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global element */
/* global expect */

describe('Login Page', function() {
  it('should display the login form', function() {
    browser.get('#/login');
    browser.waitForAngular();
    expect(element(by.css('form')).getAttribute('name')).toEqual('loinForm');
  });
});
