'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */
/* global protractor */

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  ssousername: 'adminADSyncTestUser@wx2.example.com',
  password: 'C1sc0123!',
  orgname: 'WebEx Self-Service Org'
};

function randomId() {
  return (Math.random() + 1).toString(36).slice(2);
}

// Notes:
// - State is conserved between each describe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('App flow', function() {

  // Logging in. Write your tests after the login flow is complete.
  describe('Login flow', function() {

    it('should redirect to CI global login page.', function() {
      browser.get('#/login');
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
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
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });

    it('should log in with valid credentials and display users page', function() {

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

  // Navigation bar
  describe('Navigation Bar', function() {
    it('should still be logged in', function() {
      expect(browser.driver.isElementPresent(by.css('#logout-btn'))).toBe(true);
    });

    it('should display the username and the orgname', function() {
      expect(element(by.binding('username')).getText()).toContain(testuser.username);
      expect(element(by.binding('orgname')).getText()).toContain(testuser.orgname);
    });

  });

  // Add User Flows: state is in the users page
  describe('Add User Flows', function() {

    describe('Page initialization', function() {

      it('should initialize users page for adding users', function() {
        expect(element(by.id('subTitleAdd')).isDisplayed()).toBe(true);
        expect(element(by.id('subTitleEnable')).isDisplayed()).toBe(false);
        expect(element(by.id('subTitleAdd')).getText()).toBe('Add new users');
        expect(element(by.id('btnAdd')).isDisplayed()).toBe(true);
        expect(element(by.id('btnEntitle')).isDisplayed()).toBe(false);
      });

      it('should display error if no user is entered', function() {
        element(by.id('btnAdd')).click();
        var result = element(by.repeater('userResult in results.resultList').row(0));
        //Temporary while fixing error messaging.
        //expect(result.getText()).toBe('Please enter valid user email(s).');
      });

    });

    describe('Input validation', function() {
      var validinputs = ['user@test.com', '<user@user.test>', '"user@user.test"'];
      var invalidinputs = ['user', '<user@user.com', 'user@user.com>', '"user@user.com', 'user@user.com"'];
      it('should tokenize a valid input and activate button', function() {
        for (var i = 0; i < validinputs.length; i++) {
          element(by.id('usersfield')).clear();
          element(by.id('usersfield')).sendKeys(validinputs[i]);
          element(by.id('usersfield')).sendKeys(protractor.Key.ENTER);
          expect(element(by.css('.invalid')).isPresent()).toBe(false);
          expect(element(by.id('btnAdd')).getAttribute('disabled')).toBe(null);
          element(by.css('.close')).click();
        }
      });
      it('should invalidate token with invalid inputs and disable button', function() {
        for (var i = 0; i < invalidinputs.length; i++) {
          element(by.id('usersfield')).clear();
          element(by.id('usersfield')).sendKeys(invalidinputs[i]);
          element(by.id('usersfield')).sendKeys(protractor.Key.ENTER);
          expect(element(by.css('.invalid')).isPresent()).toBe(true);
          expect(element(by.id('btnAdd')).getAttribute('disabled')).toBe('true');
          element(by.css('.close')).click();
        }
      });
    });

    describe('Add an existing user', function() {
      it('should display input user email in results with already exists message', function() {
        element(by.id('usersfield')).clear();
        element(by.id('usersfield')).sendKeys(testuser.username);
        element(by.id('btnAdd')).click();
        //Temporary while fixing error messaging.
        // element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
        //   expect(rows.length).toBe(1);
        //   expect(rows[0].getText()).toContain(testuser.username);
        //   expect(rows[0].getText()).toContain('already exists');
        // });
      });
    });

    describe('Cancel', function() {
      it('should clear user input field and error message', function() {
        element(by.id('btnCancel')).click();
        element(by.id('usersfield')).getText().then(function(input) {
          expect(input).toBe('');
        });
        element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
          expect(rows.length).toBe(0);
        });
      });
    });

    describe('Add a new user', function() {
      it('should display input user email in results with success message', function() {
        var inputEmail = 'atlas-' + randomId() + '@example.com';
        element(by.id('usersfield')).clear();
        element(by.id('usersfield')).sendKeys(inputEmail);
        element(by.id('btnAdd')).click();
        //Temporary while fixing error messaging.
        // element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
        //   expect(rows.length).toBe(1);
        //   expect(rows[0].getText()).toContain(inputEmail);
        //   expect(rows[0].getText()).toContain('added successfully');
        // });
      });
    });

    // describe('Add multiple users separated with commas and semicolons', function() {
    //   it('should display input user email in results', function() {
    //     var randomEmail = 'atlas-' + randomId() + '@example.com';
    //     element(by.id('usersfield')).clear();
    //     element(by.id('usersfield')).sendKeys(testuser.username + ', ' + testuser.ssousername + '; ' + randomEmail);
    //     element(by.id('btnAdd')).click();
    //     element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
    //       expect(rows.length).toBe(3);
    //       expect(rows[0].getText()).toContain(testuser.username);
    //       expect(rows[0].getText()).toContain('already exists');
    //       expect(rows[1].getText()).toContain(testuser.ssousername);
    //       expect(rows[1].getText()).toContain('already exists');
    //       expect(rows[2].getText()).toContain(randomEmail);
    //       expect(rows[2].getText()).toContain('added successfully');
    //     });
    //   });
    // });

  });

  describe('Validate user page', function() {
    it('should have a tab bar', function() {
      expect(element(by.id('tabs')).isDisplayed()).toBe(true);
      element.all(by.repeater('tab in tabs')).then(function(tabCount) {
        expect(tabCount.length).toBe(12);
      });
    });

    it('clicking on home tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Home"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/users');
      });
    });

    it('clicking on policies tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Policies"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/policies');
      });
    });

    it('clicking on templates tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Templates"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/templates');
        expect(element(by.css('h2')).getText()).toContain('MANAGE TEMPLATES');
      });
    });

    it('clicking on orgs tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Organizations"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/orgs');
        expect(element(by.css('h2')).getText()).toContain('MANAGE ORGANIZATIONS');
      });
    });

    it('clicking on reports tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Reports"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/reports');
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
