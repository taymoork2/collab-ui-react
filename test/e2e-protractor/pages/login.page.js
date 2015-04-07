'use strict';

var LoginPage = function () {

  this.setLoginUsername = function (username) {
    browser.driver.findElement(by.id('IDToken1')).sendKeys(username);
  };
  this.clickLoginNext = function () {
    browser.driver.findElement(by.id('IDButton2')).click();
  };
  this.setLoginPassword = function (password) {
    browser.driver.findElement(by.id('IDToken2')).sendKeys(password);
  };
  this.clickLoginSubmit = function () {
    browser.driver.findElement(by.id('Button1')).click();
  };

  this.isLoginUsernamePresent = function () {
    return browser.driver.isElementPresent(by.id('IDToken1'));
  };
  this.isLoginPasswordPresent = function () {
    return browser.driver.isElementPresent(by.id('IDToken2'));
  };

  this.setSSOUsername = function (username) {
    browser.driver.findElement(by.id('username')).sendKeys(username);
  };
  this.setSSOPassword = function (password) {
    browser.driver.findElement(by.id('password')).sendKeys(password);
  };
  this.clickSSOSubmit = function () {
    browser.driver.findElement(by.css('button[type="submit"]')).click();
  };
  this.isLoginSSOPresent = function () {
    return browser.driver.isElementPresent(by.id('username')) && browser.driver.isElementPresent(by.id('password'));
  };

  this.assertLoginError = function (msg) {
    expect(browser.driver.findElement(by.css('.generic-error')).getText()).toContain(msg);
  };

  this.loginButton = element(by.cssContainingText('span[role="button"]', 'Login'));

  this.login = function (username, expectedUrl) {
    var bearer;
    browser.get(typeof expectedUrl !== 'undefined' ? expectedUrl : '#/login');
    navigation.expectDriverCurrentUrl('login');
    helper.getBearerToken(username, function (_bearer) {
      bearer = _bearer;
      expect(bearer).not.toBeNull();
      browser.executeScript("localStorage.accessToken='" + bearer + "'");
      browser.refresh();
      navigation.expectDriverCurrentUrl(typeof expectedUrl !== 'undefined' ? expectedUrl : '/overview');
    });
    browser.wait(function () {
      return bearer;
    }, 10000, 'Could not retrieve bearer token to login');
  };

  this.loginUnauthorized = function (username, expectedUrl) {
    var bearer;
    browser.get(typeof expectedUrl !== 'undefined' ? expectedUrl : '#/login');
    navigation.expectDriverCurrentUrl('login');
    helper.getBearerToken(username, function (_bearer) {
      bearer = _bearer;
      expect(bearer).not.toBeNull();
      browser.executeScript("localStorage.accessToken='" + bearer + "'");
      browser.refresh();
      navigation.expectDriverCurrentUrl(typeof expectedUrl !== 'undefined' ? expectedUrl : '/unauthorized');
    });
    browser.wait(function () {
      return bearer;
    }, 10000, 'Could not retrieve bearer token to login');
  };

  this.loginThroughGui = function (username, password, expectedUrl) {
    browser.get(typeof expectedUrl !== 'undefined' ? expectedUrl : '#/login');
    utils.click(this.loginButton);
    browser.driver.wait(this.isLoginUsernamePresent);
    this.setLoginUsername(username);
    this.clickLoginNext();
    browser.driver.wait(this.isLoginPasswordPresent);
    this.setLoginPassword(password);
    this.clickLoginSubmit();
    navigation.expectDriverCurrentUrl(typeof expectedUrl !== 'undefined' ? expectedUrl : '/overview');
  };
};

module.exports = LoginPage;
