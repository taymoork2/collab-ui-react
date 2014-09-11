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

  xit('should log in with valid sso admin user and display home page', function() {
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

describe('Org Entitlement flow', function() {
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

describe('Navigating to users tab', function() {
	it('clicking on users tab should show the users info', function() {
		element(by.css('li[heading="Users"]')).click();
		browser.driver.wait(function() {
			return browser.driver.isElementPresent(by.id('tabs'));
		}).then(function() {
      expect(browser.getCurrentUrl()).toContain('/users');
    });
  });
});

describe('Updating entitlements', function() {
  it('should display conversations panel', function() {
    element(by.id('search-input')).clear();
    browser.sleep(500);
    element(by.id('search-input')).sendKeys(testuser.username).then(function() {
      browser.sleep(1000);
      element(by.binding('user.userName')).getText().then(function(uname) {
        expect(uname).toContain(testuser.username);
      });
      element(by.binding('user.userName')).click();
      browser.sleep(500);
      expect(element(by.id('squaredPanel')).isDisplayed()).toBe(true);
      expect(element(by.id('huronPanel')).isDisplayed()).toBe(false);
      expect(element(by.id('conferencePanel')).isDisplayed()).toBe(false);
      expect(element(by.id('endpointPanel')).isDisplayed()).toBe(false);
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

