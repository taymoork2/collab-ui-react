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
  searchValidLocusid: '5354d535-9aaf-5e22-a091-34de878d2200',
  searchNonexistentMetadata: 'qqt7y812twuiy900909-2jijeqbd,,.mjmj123qwsah77&89%$3wesa@54a'
};

var supportuser = {
  username: 'atlasmapservice+support1@gmail.com',
  password: 'C1sc0123!',
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

    it('should log in with valid admin user and display home page', function() {
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

    it('should display correct tabs for user based on role', function() {
      element.all(by.repeater('tab in tabs')).then(function(rows) {
        expect(rows.length).toBe(10);  // double number of actual tabs due to generated divs
        expect(element(by.css('li[heading="Home"]')).isDisplayed()).toBe(true);
        expect(element(by.css('li[heading="Users"]')).isDisplayed()).toBe(true);
        expect(element(by.css('li[heading="Manage"]')).isDisplayed()).toBe(true);
        expect(element(by.css('li[heading="Reports"]')).isDisplayed()).toBe(true);
        expect(element(by.css('li[heading="Support"]')).isDisplayed()).toBe(true);
      });
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

    it('should not display results panel initially', function() {
      expect(element(by.id('logs-panel')).isDisplayed()).toEqual(false);
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
        expect(element(by.id('emailAddressHeading')).getText()).toBe('Email Address');
        expect(element(by.id('locusIdHeading')).getText()).toBe('Locus ID');
        expect(element(by.id('callStartHeading')).getText()).toBe('Call Start Time');
        expect(element(by.id('dateHeading')).getText()).toBe('Upload Time');
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
        expect(element(by.id('emailAddressHeading')).getText()).toBe('Email Address');
        expect(element(by.id('locusIdHeading')).getText()).toBe('Locus ID');
        expect(element(by.id('callStartHeading')).getText()).toBe('Call Start Time');
        expect(element(by.id('dateHeading')).getText()).toBe('Upload Time');
        element.all(by.repeater('log in userLogs')).then(function(rows) {
          expect(rows.length).toBeGreaterThan(0);
        });
      });
    });

    it('should search for logs by valid locusId', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchValidLocusid).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(3000);
        expect(element(by.id('emailAddressHeading')).getText()).toBe('Email Address');
        expect(element(by.id('locusIdHeading')).getText()).toBe('Locus ID');
        expect(element(by.id('callStartHeading')).getText()).toBe('Call Start Time');
        expect(element(by.id('dateHeading')).getText()).toBe('Upload Time');
        element.all(by.repeater('log in userLogs')).then(function(rows) {
          expect(rows.length).toBeGreaterThan(0);
          expect(element(by.binding('log.locusId')).getText()).toBe(testuser.searchValidLocusid);
          expect(element(by.binding('log.callStart')).getText()).not.toBe('-NA-');
        });
      });
    });

    it('should not return results for non existent metadata search', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchNonexistentMetadata).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(500);
        expect(element(by.id('noResults')).getText()).toBe('No Results.');
      });
    });

    it('should search for logs by valid email address and display log info', function() {
      element(by.id('logsearchfield')).clear();
      element(by.id('logsearchfield')).sendKeys(testuser.searchValidEmail).then(function() {
        element(by.id('logSearchBtn')).click();
        browser.sleep(3000);
        expect(element(by.id('emailAddressHeading')).getText()).toBe('Email Address');
        expect(element(by.id('locusIdHeading')).getText()).toBe('Locus ID');
        expect(element(by.id('callStartHeading')).getText()).toBe('Call Start Time');
        expect(element(by.id('dateHeading')).getText()).toBe('Upload Time');
        element.all(by.repeater('log in userLogs')).then(function(rows) {
          expect(rows.length).toBeGreaterThan(0);
        });
        element(by.id('callInfo-icon')).click();
        browser.sleep(1000);
        expect(element(by.id('closeCallInfo')).isDisplayed()).toBe(true);
        element(by.id('closeCallInfo')).click();
        expect(element(by.id('closeCallInfo')).isDisplayed()).toBe(false);
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

  describe('Squared Support Role', function() {
  // Logging in. Write your tests after the login flow is complete.
    describe('Login as squared support user', function() {

      it('should redirect to CI global login page.', function() {
        browser.get('#/login');
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.css('#IDToken1'));
        }).then(function() {
          expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
        });
      });

      it('should log in with valid admin user and display home page', function() {
        browser.driver.findElement(by.css('#IDToken1')).sendKeys(supportuser.username);
        browser.driver.findElement(by.css('#IDButton2')).click();
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.css('#IDToken2'));
        }).then(function() {
          browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
          browser.driver.findElement(by.css('#Button1')).click();
        });

        expect(browser.getCurrentUrl()).toContain('/home');
      });

      it('should display correct tabs for user based on role', function() {
        element.all(by.repeater('tab in tabs')).then(function(rows) {
          expect(rows.length).toBe(6);  // double number of actual tabs due to generated divs
          expect(element(by.css('li[heading="Home"]')).isDisplayed()).toBe(true);
          expect(element(by.css('li[heading="Reports"]')).isDisplayed()).toBe(true);
          expect(element(by.css('li[heading="Support"]')).isDisplayed()).toBe(true);
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
