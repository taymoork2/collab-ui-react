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
  orgname: 'SquaredAdminTool',
  searchStr: 'fake'
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as non-sso admin user', function() {

  it('should login', function(){
    login.login(testuser.username, testuser.password);
  });

  xit('should redirect to CI global login page.', function() {
    browser.get('#/login');
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });
  });

  xit('should log in with valid non-sso admin user and display home page', function() {
    browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
    browser.driver.findElement(by.css('#IDButton2')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken2'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
      browser.driver.findElement(by.css('#Button1')).click();
    });

    expect(browser.getCurrentUrl()).toContain('/home');
  });

}); //State is logged-in

describe('Org Info flow', function() {
  beforeEach(function() {
    this.addMatchers({
      toBeLessThanOrEqualTo: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: actual < expected || actual === expected,
              message: 'Expected ' + actual + 'to be less than or equal to ' + expected
            };
          }
        };
      }
    });
  });
});

describe('Navigating to organization tab', function() {
	it('clicking on orgs tab should show the org info', function() {
		element(by.css('li[heading="Manage"]')).click();
		browser.driver.wait(function() {
			return browser.driver.isElementPresent(by.id('tabs'));
		}).then(function() {
      expect(browser.getCurrentUrl()).toContain('/orgs');
      expect(element(by.id('displayName')).isDisplayed()).toEqual(true);
      expect(element(by.id('estimatedSize')).isDisplayed()).toEqual(true);
      expect(element(by.id('totalUsers')).isDisplayed()).toEqual(true);
      expect(element(by.id('sso')).isDisplayed()).toEqual(true);
      expect(element(by.id('btnSave')).isDisplayed()).toEqual(false);
      expect(element(by.id('btnReset')).isDisplayed()).toEqual(true);
    });
  });
});


// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    element(by.id('setting-bar')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('logout-btn'));
    }).then(function() {
      element(by.id('logout-btn')).click();
    });
  });
});

