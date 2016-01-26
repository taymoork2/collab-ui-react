'use strict';

/* eslint-disable */
/* global describe */
/* global it */
/* global navigation, users, utils, notifications, protractor, deleteUtils, browser*/

describe('Test the createAccount page', function () {

  var newEmail = 'foo' + Math.floor(Math.random() * 10000000) + '@bar.com';
  browser.get('#/createAccount?email=' + newEmail);
  // browser.driver.sleep(1000);

  it('should have the right title', function () {
    expect(element(by.id('title')).getInnerHtml()).toEqual('Create Account');
    expect(element(by.id('h2')).getInnerHtml()).toEqual('Create Account');
  });

  it('should have the right labels', function () {
    expect(element(by.id('emailLabel')).getInnerHtml()).toEqual("Enter your email address:");
    expect(element(by.id('passwordLabel')).getInnerHtml()).toEqual("Enter your password:");
  });

  it('should have all the correct field values', function () {
    expect(element(by.model('email1')).getAttribute('value')).toEqual(newEmail);
    expect(element(by.model('email2')).getAttribute('value')).toEqual('');
    expect(element(by.model('password1')).getAttribute('value')).toEqual('');
    expect(element(by.model('password2')).getAttribute('value')).toEqual('');
  });

  it('should have a next button', function () {
    expect(element(by.id('next')).getInnerHtml()).toEqual('Next');
  });

  it('should not allow mismatched emails', function () {
    element(by.model('password1')).sendKeys('foo');
    element(by.model('password2')).sendKeys('foo');
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('Emails do not match');
    element(by.model('email2')).sendKeys('foo');
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('Emails do not match');
  });

  it('should not allow blank email', function () {
    element(by.model('email1')).clear();
    element(by.model('email2')).clear();
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('Empty email');
  });

  it('should not allow blank password', function () {
    element(by.model('password1')).clear();
    element(by.model('password2')).clear();
    element(by.model('email1')).sendKeys(newEmail);
    element(by.model('email2')).sendKeys(newEmail);
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('Empty password');
  });

  it('should not allow mismatched passwords', function () {
    element(by.model('password1')).sendKeys('foo');
    element(by.model('password2')).sendKeys('bar');
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('Passwords do not match');
  });

  it('should forward to the create account page', function () {
    element(by.model('password1')).clear();
    element(by.model('password2')).clear();
    element(by.model('password1')).sendKeys('P@ssword123');
    element(by.model('password2')).sendKeys('P@ssword123');
    element(by.id('next')).click();
    // browser.driver.sleep(3000);
    browser.getCurrentUrl().
    then(function (url) {
      expect(url).toContain('digitalriver');
    });
  });

  it('should validate existing user', function () {
    element(by.model('email2')).sendKeys(newEmail);
    element(by.model('password1')).sendKeys('P@ssword123');
    element(by.model('password2')).sendKeys('P@ssword123');
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    expect(element(by.model('error')).getAttribute('value')).toEqual('User ' + newEmail + ' already exists');
  });

  it('should validate existing user for the checkEmailAddr page too', function () {
    browser.get('#/enterEmailAddr');
    element(by.model('email')).sendKeys(newEmail);
    // browser.driver.sleep(1000);
    element(by.id('next')).click();
    // browser.driver.sleep(1000);
    browser.getCurrentUrl().
    then(function (url) {
      expect(url).not.toContain('/#/createAccount');
    });
  });

});
