'use strict'

var LoginPage = function(){

  this.setLoginUsername = function(username){
    browser.driver.findElement(by.id('IDToken1')).sendKeys(username);
  };
  this.clickLoginNext = function(){
    browser.driver.findElement(by.id('IDButton2')).click();
  };
  this.setLoginPassword = function(password){
    browser.driver.findElement(by.id('IDToken2')).sendKeys(password);
  };
  this.clickLoginSubmit = function(){
    browser.driver.findElement(by.id('Button1')).click();
  };

  this.isLoginUsernamePresent = function(){
    return browser.driver.isElementPresent(by.id('IDToken1'));
  };
  this.isLoginPasswordPresent = function(){
    return browser.driver.isElementPresent(by.id('IDToken2'));
  };

  this.setSSOUsername = function(username){
    browser.driver.findElement(by.id('username')).sendKeys(username);
  };
  this.setSSOPassword = function(password){
    browser.driver.findElement(by.id('password')).sendKeys(password);
  };
  this.clickSSOSubmit = function(){
    browser.driver.findElement(by.css('button[type="submit"]')).click();
  };
  this.isLoginSSOPresent = function(){
    return browser.driver.isElementPresent(by.id('username')) && browser.driver.isElementPresent(by.id('password'));
  };

  this.assertLoginError = function(msg){
    expect(browser.driver.findElement(by.css('.generic-error')).getText()).toContain(msg);
  };

  this.get = function(){
    browser.get('#/login');
  };

  this.login = function(username,password) {
    this.get();
    browser.driver.wait(this.isLoginUsernamePresent);
    this.setLoginUsername(username);
    this.clickLoginNext();
    browser.driver.wait(this.isLoginPasswordPresent);
    this.setLoginPassword(password);
    this.clickLoginSubmit();
    navigation.expectCurrentUrl('/home');
    browser.executeScript('$.fx.off = true;'); // Disable jQuery animations
  };

  this.partnerlogin = function(username,password) {
    this.get();
    browser.driver.wait(this.isLoginUsernamePresent);
    this.setLoginUsername(username);
    this.clickLoginNext();
    browser.driver.wait(this.isLoginPasswordPresent);
    this.setLoginPassword(password);
    this.clickLoginSubmit();
    navigation.expectCurrentUrl('/partnerhome');
    browser.executeScript('$.fx.off = true;'); // Disable jQuery animations
  };

  this.loginSSO = function(username,password) {
    this.get();
    browser.driver.wait(this.isLoginUsernamePresent);
    this.setLoginUsername(username);
    this.clickLoginNext();
    browser.driver.wait(this.isLoginSSOPresent);
    this.setSSOUsername(username);
    this.setSSOPassword(password);
    this.clickSSOSubmit();
    navigation.expectCurrentUrl('/home');
    browser.executeScript('$.fx.off = true;'); // Disable jQuery animations
  };

  this.loginSSOSecondTime = function(username) {
    this.get();
    browser.driver.wait(this.isLoginUsernamePresent);
    this.setLoginUsername(username);
    this.clickLoginNext();
    navigation.expectDriverCurrentUrl('/home');
    browser.executeScript('$.fx.off = true;'); // Disable jQuery animations
  };
};

module.exports = LoginPage;