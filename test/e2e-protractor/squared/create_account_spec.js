'use strict';

/* global describe, utils */
/* global enterEmailAddrPage, createAccountPage */

describe('Test the createAccount page', function () {

  var newEmail = utils.randomTestGmail();
  browser.get('#/create-account?email=' + newEmail);

  it('should have the right title', function () {
    utils.expectAttribute(createAccountPage.h2, 'innerHTML','Create Account');
  });

  it('should have the right labels', function () {
    utils.expectAttribute(createAccountPage.emailLabel, 'innerHTML', 'Enter your email address:');
    utils.expectAttribute(createAccountPage.passwordLabel, 'innerHTML', 'Enter your password:');
  });

  it('should have all the correct field values', function () {
    utils.expectAttribute(createAccountPage.email1, 'value', newEmail);
    utils.expectAttribute(createAccountPage.email2, 'value', '');
    utils.expectAttribute(createAccountPage.password1, 'value', '');
    utils.expectAttribute(createAccountPage.password2, 'value', '');
  });

  it('should have a next button', function () {
    utils.expectAttribute(createAccountPage.nextButton, 'innerHTML','Next');
  });

  it('should not allow mismatched emails', function () {
    utils.expectAttribute(createAccountPage.errorMsg, 'value', '');
    utils.sendKeys(createAccountPage.password1, 'foo');
    utils.sendKeys(createAccountPage.password2, 'foo');
    utils.click(createAccountPage.nextButton);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'Emails do not match');
    utils.sendKeys(createAccountPage.email2, 'foo');
    utils.click(createAccountPage.nextButton);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'Emails do not match');
  });

  it('should not allow blank email', function () {
    utils.clear(createAccountPage.email1);
    utils.clear(createAccountPage.email2);
    utils.click(createAccountPage.nextButton);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'Empty email');
  });

  it('should not allow blank password', function () {
    utils.clear(createAccountPage.password1);
    utils.clear(createAccountPage.password2);
    utils.sendKeys(createAccountPage.email1, newEmail);
    utils.sendKeys(createAccountPage.email2, newEmail);
    utils.click(createAccountPage.nextButton);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'Empty password');
  });

  it('should not allow mismatched passwords', function () {
    utils.sendKeys(createAccountPage.password1, 'foo');
    utils.sendKeys(createAccountPage.password2, 'bar');
    utils.click(createAccountPage.nextButton);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'Passwords do not match');
  });

  it('should forward to the digital river page', function () {
    utils.clear(createAccountPage.password1);
    utils.clear(createAccountPage.password2);
    utils.sendKeys(createAccountPage.password1, 'P@ssword123');
    utils.sendKeys(createAccountPage.password2, 'P@ssword123');
    utils.click(createAccountPage.nextButton);
    utils.expectIsNotDisplayed(createAccountPage.nextButton);
  });

  it('should validate existing user', function () {
    browser.get('#/create-account?email=' + newEmail);
    utils.sendKeys(createAccountPage.email2, newEmail);
    utils.sendKeys(createAccountPage.password1, 'P@ssword123');
    utils.sendKeys(createAccountPage.password2, 'P@ssword123');
    utils.click(createAccountPage.nextButton);
    utils.waitForTextBoxValue(createAccountPage.errorMsg);
    utils.expectAttribute(createAccountPage.errorMsg, 'value', 'User ' + newEmail + ' already exists');
  });

  it('should validate existing user for the checkEmailAddr page too', function () {
    browser.get('#/enter-email-addr');
    utils.sendKeys(enterEmailAddrPage.email, newEmail);
    utils.click(createAccountPage.nextButton);
    utils.expectIsNotDisplayed(enterEmailAddrPage.email);
    utils.expectIsNotDisplayed(createAccountPage.email1);
  });

  it('should delete the created user', function () {
    deleteUtils.deleteUser(newEmail);
  });

});
