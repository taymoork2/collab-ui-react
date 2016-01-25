'use strict';

var CreateAccountPage = function () {
  this.pageTitle = element(by.id('title'));
  this.h2 = element(by.id('h2'));
  this.emailLabel = element(by.id('emaillabel'));
  this.passwordLabel = element(by.id('passwordlabel'));
  this.email1 = element(by.model('email1'));
  this.email2 = element(by.model('email2'));
  this.password1 = element(by.model('password1'));
  this.password2 = element(by.model('password2'));
  this.nextButton = element(by.id('next'));
  this.nextButton = element(by.model('error'));
};

module.exports = CreateAccountPage;
