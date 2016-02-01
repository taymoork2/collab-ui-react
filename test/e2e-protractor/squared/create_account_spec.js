'use strict';

/* eslint-disable */
/* global describe */
/* global it */
/* global navigation, users, utils, notifications, protractor, deleteUtils, browser*/

describe('Test the createAccount page', function () {

  var newEmail = 'foo' + Math.floor(Math.random() * 10000000) + '@bar.com';
  browser.get('#/createAccount?email=' + newEmail);

  it('should have the right title', function () {
    expect(createAccountPage.pageTitle.getInnerHtml()).toEqual('Create Account');
    expect(createAccountPage.h2.getInnerHtml()).toEqual('Create Account');
  });

  it('should have the right labels', function () {
    expect(createAccountPage.emailLabel.getInnerHtml()).toEqual("Enter your email address:");
    expect(createAccountPage.passwordLabel.getInnerHtml()).toEqual("Enter your password:");
  });

  it('should have all the correct field values', function () {
    expect(createAccountPage.email1.getAttribute('value')).toEqual(newEmail);
    expect(createAccountPage.email2.getAttribute('value')).toEqual('');
    expect(createAccountPage.password1.getAttribute('value')).toEqual('');
    expect(createAccountPage.password2.getAttribute('value')).toEqual('');
  });

  it('should have a next button', function () {
    expect(createAccountPage.nextButton.getInnerHtml()).toEqual('Next');
  });

  it('should not allow mismatched emails', function () {
    createAccountPage.password1.sendKeys('foo');
    createAccountPage.password2.sendKeys('foo');
    createAccountPage.nextButton.click();
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('Emails do not match');
    createAccountPage.email2.sendKeys('foo');
    createAccountPage.nextButton.click();
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('Emails do not match');
  });

  it('should not allow blank email', function () {
    createAccountPage.email1.clear();
    createAccountPage.email2.clear();
    createAccountPage.nextButton.click();
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('Empty email');
  });

  it('should not allow blank password', function () {
    createAccountPage.password1.clear();
    createAccountPage.password2.clear();
    createAccountPage.email1.sendKeys(newEmail);
    createAccountPage.email2.sendKeys(newEmail);
    createAccountPage.nextButton.click();
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('Empty password');
  });

  it('should not allow mismatched passwords', function () {
    createAccountPage.password1.sendKeys('foo');
    createAccountPage.password2.sendKeys('bar');
    createAccountPage.nextButton.click();
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('Passwords do not match');
  });

  it('should forward to the digital river page', function () {
    createAccountPage.password1.clear();
    createAccountPage.password2.clear();
    createAccountPage.password1.sendKeys('P@ssword123');
    createAccountPage.password2.sendKeys('P@ssword123');
    createAccountPage.nextButton.click();
    browser.driver.sleep(8000);
    browser.getCurrentUrl().
    then(function (url) {
      expect(url).toContain('digitalriver');
    });
  });

  it('should validate existing user', function () {
    browser.get('#/createAccount?email=' + newEmail);
    createAccountPage.email2.sendKeys(newEmail);
    createAccountPage.password1.sendKeys('P@ssword123');
    createAccountPage.password2.sendKeys('P@ssword123');
    createAccountPage.nextButton.click();
    browser.driver.sleep(3000);
    expect(createAccountPage.errorMsg.getAttribute('value')).toEqual('User ' + newEmail + ' already exists');
  });

  it('should validate existing user for the checkEmailAddr page too', function () {
    browser.get('#/enterEmailAddr');
    enterEmailAddrPage.email.sendKeys(newEmail);
    createAccountPage.nextButton.click();
    browser.getCurrentUrl().
    then(function (url) {
      expect(url).not.toContain('/#/createAccount');
    });
  });

});
