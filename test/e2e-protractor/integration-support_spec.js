'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin-test@wx2.example.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool',
  searchValidEmail: 'pbr-org-admin@squared2webex.com',
  searchValidUuid: 'd6688fc9-414d-44ce-a166-759530291edc',
  searchInvalidSearchInput: 'invalidSearchInput',
  searchUuidNotExisting: 'd6688fc9-414d-44ce-a166-759530291eds',
  searchUuidUnauthorized: '2c7bfde0-93c8-4ccd-a961-1b04df05bb66'
};

describe('Support flow', function() {
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

    it('should log in with valid sso admin user and display home page', function() {
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

  describe('Support tab', function() {
    //Test if Support tab is present
    it('should display correct tabs for user based on role', function() {
      expect(element(by.css('li[heading="Support"]')).isDisplayed()).toBe(true);
    });

    it('clicking on support tab should change the view', function() {
      element(by.css('li[heading="Support"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/support');
      });
    });

    it('should display error for empty input', function() {
      //element(by.id('logsearchfield')).clear();
      element(by.id('logSearchBtn')).click();
      browser.sleep(500);
      element(by.css('.alertify-log-error')).click().then(function() {
        browser.sleep(500);
        expect(element(by.css('.panel-danger-body p')).getText()).toBe('Search input cannot be empty.');
        browser.sleep(500);
        element(by.css('.fa-times')).click();
        browser.sleep(500);
      });
    });

    it('should search for logs by valid email address', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchValidEmail).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(3000);
        element.all(by.repeater('log in userLogs')).then(function(rows) {
          expect(rows.length).toBeGreaterThan(0);
        });
      });
    });

    it('should search for logs by valid uuid', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchValidUuid).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(3000);
        element.all(by.repeater('log in userLogs')).then(function(rows) {
          expect(rows.length).toBeGreaterThan(0);
        });
      });
    });

    it('should display error for invalid input', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchInvalidSearchInput).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(500);
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toContain('Invalid input:');
          expect(element(by.css('.panel-danger-body p')).getText()).toContain(testuser.searchInvalidSearchInput);
          expect(element(by.css('.panel-danger-body p')).getText()).toContain('Enter valid email address or uuid.');
          browser.sleep(500);
          element(by.css('.fa-times')).click();
          browser.sleep(500);
        });
      });
    });

    it('should display error for non existing uuid', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchUuidNotExisting).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(500);
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toContain('User does not exist :');
          expect(element(by.css('.panel-danger-body p')).getText()).toContain(testuser.searchUuidNotExisting);
          browser.sleep(500);
          element(by.css('.fa-times')).click();
          browser.sleep(500);
        });
      });
    });

    it('should display error for unauthorized uuid', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchUuidUnauthorized).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(500);
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toContain('You are not authorized to view the logs of this user :');
          expect(element(by.css('.panel-danger-body p')).getText()).toContain(testuser.searchUuidUnauthorized);
          browser.sleep(500);
          element(by.css('.fa-times')).click();
          browser.sleep(500);
        });
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

});
