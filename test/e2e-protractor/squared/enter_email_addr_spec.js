'use strict';

/* eslint-disable */
/* global describe */
/* global it */
/* global navigation, users, utils, notifications, protractor, deleteUtils, browser*/

describe('Test the enterEmailAddr page', function () {

  console.log('beginning test');
  browser.get('#/enterEmailAddr');
  // browser.driver.sleep(1000);

  it('should have the right title', function () {
    expect(element(by.id('title')).getInnerHtml()).toEqual('Atlas Portal Shopping Cart Login (APSCL)');
    expect(element(by.id('h2')).getInnerHtml()).toEqual('Enter eMail Addr');
  });

  it('should have the right label', function () {
    expect(element(by.id('label')).getInnerHtml()).toEqual('Enter your email address:');
  });

  it('should have a blank text field', function () {
    expect(element(by.model('email')).getAttribute('value')).toEqual('')
  });

  it('should have a next button', function () {
    expect(element(by.id('next')).getInnerHtml()).toEqual('Next');
  });

  it('should not allow an empty email address', function () {
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('The email address cannot be blank');
  });

  it('unrecongnized email address should forward to the create account page', function () {
    var randomEmail = 'foo' + Math.floor(Math.random() * 10000000) + '@bar.com';
    element(by.model('email')).sendKeys(randomEmail);
    // browser.driver.sleep(1000);
    element(by.id('next')).click();
    // browser.driver.sleep(3000);
    browser.getCurrentUrl().
      then(function (url) {
        expect(url).toContain('/#/createAccount');
      });
  });

});
