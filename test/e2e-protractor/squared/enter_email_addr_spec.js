'use strict';

/* global describe, utils */
/* global enterEmailAddrPage, createAccountPage */

describe('Test the enterEmailAddr page', function () {

  browser.get('#/enter-email-addr');

  it('should have the right title', function () {
    utils.expectAttribute(enterEmailAddrPage.h2, 'innerHTML','Enter eMail Addr');
  });

  it('should have the right label', function () {
    utils.expectAttribute(enterEmailAddrPage.pageLabel, 'innerHTML', 'Enter your email address:');
  });

  it('should have a blank text field', function () {
    utils.expectAttribute(enterEmailAddrPage.email, 'value', '');
  });

  it('should have a next button', function () {
    utils.expectAttribute(enterEmailAddrPage.nextButton, 'innerHTML','Next');
  });

  it('should not allow an empty email address', function () {
    utils.expectAttribute(enterEmailAddrPage.errorMsg, 'value', '');
    utils.click(enterEmailAddrPage.nextButton);
    utils.expectAttribute(enterEmailAddrPage.errorMsg, 'value', 'The email address cannot be blank');
  });

  it('unrecongnized email address should forward to the create account page', function () {
    utils.sendKeys(enterEmailAddrPage.email, utils.randomTestGmail());
    utils.click(enterEmailAddrPage.nextButton);
    utils.expectIsDisplayed(createAccountPage.email1);
  });

});
