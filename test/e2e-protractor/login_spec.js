'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  password: 'C1sc0123!'
};



describe('Login flow', function() {

  beforeEach(function() {
    //Setup before each test is run.
  });

  afterEach(function() {
    //Cleanup after each test is run.
  });

  it('should redirect to CI global login page.', function() {
    browser.get('#/login');
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
    });
  });

  it('should log in with valid credentials and display users page', function() {
    browser.get('#/login');

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
      browser.driver.findElement(by.css('#IDButton2')).click();
    });

    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken2'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
      browser.driver.findElement(by.css('#Button1')).click();
    });

    expect(browser.getCurrentUrl()).toContain('/users');
    expect(browser.driver.findElement(by.css('h2')).getText()).toContain('User Accounts');
  });

});
