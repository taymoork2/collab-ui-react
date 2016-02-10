'use strict';

var CreateAccountPage = function () {
  this.h2 = element(by.id('dr-create-account-header'));
  this.emailLabel = element(by.id('dr-create-account-email-label'));
  this.passwordLabel = element(by.id('dr-create-account-password-label'));
  this.email1 = element(by.model('createAccountController.email1'));
  this.email2 = element(by.model('createAccountController.email2'));
  this.password1 = element(by.model('createAccountController.password1'));
  this.password2 = element(by.model('createAccountController.password2'));
  this.nextButton = element(by.id('dr-create-account-next'));
  this.errorMsg = element(by.model('createAccountController.error'));
};

module.exports = CreateAccountPage;
