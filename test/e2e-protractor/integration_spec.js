'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  password: 'C1sc0123!',
  orgname: '67d88fc6eab5 Inc.,'
};


// Notes:
// - State is conversed between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('App flow', function() {

  // Logging in. Write your tests after the login flow is complete.
  describe('login flow', function() {

    it('should redirect to CI global login page.', function() {
      browser.get('#/login');
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
      });
    });

    it('should not log in with invalid credentials', function() {
      browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
      browser.driver.findElement(by.css('#IDButton2')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken2'));
      }).then(function() {
        browser.driver.findElement(by.css('#IDToken2')).sendKeys('fakePassword');
        browser.driver.findElement(by.css('#Button1')).click();
      });
      expect(browser.driver.findElement(by.css('.generic-error')).getText()).toBe('You\'ve entered an incorrect username or password.');
      expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
    });

    it('should log in with valid credentials and display users page', function() {

      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken2'));
      }).then(function() {
        browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
        browser.driver.findElement(by.css('#Button1')).click();
      });

      expect(browser.getCurrentUrl()).toContain('/users');
      expect(browser.driver.findElement(by.css('h2')).getText()).toContain('User Accounts');
    });
  }); //State is logged-in

  // Navigation bar
  describe('Navigation Bar Flow', function() {
    it('should still be logged in', function() {
      expect(browser.driver.isElementPresent(by.css('#logout-btn'))).toBe(true);
    });

    it('should display the username and the orgname', function() {
      expect(element(by.binding('username')).getText()).toContain(testuser.username);
      expect(element(by.binding('orgname')).getText()).toContain(testuser.orgname);
    });

  });

});
