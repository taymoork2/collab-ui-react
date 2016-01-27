'use strict';

/* eslint-disable */
/* global describe */
/* global it */
/* global navigation, users, utils, notifications, protractor, deleteUtils, browser*/

describe('Test the enterEmailAddr page', function () {

  console.log('beginning test');
  browser.get('#/enterEmailAddr');

  it('should have the right title', function () {
    expect(enterEmailAddrPage.pageTitle.getInnerHtml()).toEqual('Atlas Portal Shopping Cart Login (APSCL)');
    expect(enterEmailAddrPage.h2.getInnerHtml()).toEqual('Enter eMail Addr');
  });

  it('should have the right label', function () {
    expect(enterEmailAddrPage.pageLabel.getInnerHtml()).toEqual('Enter your email address:');
  });

  it('should have a blank text field', function () {
    expect(enterEmailAddrPage.email.getAttribute('value')).toEqual('')
  });

  it('should have a next button', function () {
    expect(enterEmailAddrPage.nextButton.getInnerHtml()).toEqual('Next');
  });

  it('should not allow an empty email address', function () {
    enterEmailAddrPage.nextButton.click();
    expect(enterEmailAddrPage.errorMsg.getAttribute('value')).toEqual('The email address cannot be blank');
  });

  it('unrecongnized email address should forward to the create account page', function () {
    var randomEmail = 'foo' + Math.floor(Math.random() * 10000000) + '@bar.com';
    enterEmailAddrPage.email.sendKeys(randomEmail);
    enterEmailAddrPage.nextButton.click();
    browser.driver.sleep(3000);
    browser.getCurrentUrl().
    then(function (url) {
      expect(url).toContain('/#/createAccount');
    });
  });

});
