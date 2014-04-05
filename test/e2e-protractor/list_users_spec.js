'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool'
};

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('List users flow', function() {

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as non-sso admin user', function() {

    it('should redirect to CI global login page.', function() {
      browser.get('#/login');
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
      });
    });

    it('should log in with valid sso admin user and display users page', function() {
      browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
      browser.driver.findElement(by.css('#IDButton2')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken2'));
      }).then(function() {
        browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
        browser.driver.findElement(by.css('#Button1')).click();
      });

      expect(browser.getCurrentUrl()).toContain('/users');
      expect(element(by.css('h2')).getText()).toContain('MANAGE USERS');
    });

  }); //State is logged-in

  // Asserting listing users.
  describe('Listing users on page load', function() {
    it('should show first page of users', function() {
      expect(element(by.css('.pagination-current a')).getText()).toBe('1');
    });
    it('should list 20 or less users', function() {
      element(by.id('totalresults')).getAttribute('value').then(function(value) {
        var totalresults = parseInt(value, 10);
        if (totalresults < 20) {
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBe(totalresults);
          });
        } else {
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBe(20);
          });
        }
      });
    });
  });

  // Asserting pagination of users.
  describe('Paginating users returned', function() {
    it('should paginate the total number of users', function() {
      //pagination is only relevant if total matches exceeds 20
      element(by.id('totalresults')).getAttribute('value').then(function(value) {
        var totalresults = parseInt(value, 10);
        if (totalresults > 20) {
          var numPages = Math.ceil(totalresults / 20);
          //Initial page
          expect(element(by.css('.pagination-current a')).getText()).toBe('1');
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBe(20);
          });
          //last page
          element(by.id('last-page')).click();
          expect(element(by.css('.pagination-current a')).getText()).toBe((numPages).toString());
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBeGreaterThan(0);
          });
          //back to first page
          element(by.id('first-page')).click();
          expect(element(by.css('.pagination-current a')).getText()).toBe('1');
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBe(20);
          });
          //next page
          element(by.id('next-page')).click();
          expect(element(by.css('.pagination-current a')).getText()).toBe('2');
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBeGreaterThan(0);
          });
          //previous page
          element(by.id('prev-page')).click();
          expect(element(by.css('.pagination-current a')).getText()).toBe('1');
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            expect(rows.length).toBe(20);
          });
        }
      });
    });
  });

  // Log Out
  describe('Log Out', function() {
    it('should redirect to login page', function() {
      element(by.css('#logout-btn')).click();
      // browser.driver.wait(function() {
      //   return browser.driver.isElementPresent(by.css('#IDToken1'));
      // }).then(function() {
      //   //expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
      // });
    });
  });

});
