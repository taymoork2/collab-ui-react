'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */
/* global protractor */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool'
};

var utils = require('./testUtils.js');
var deleteUtils = require('./deleteUtils.js');

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

    it('should redirect to login page when not logged in', function() {
      browser.get('#/users');
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
      expect(browser.driver.findElement(by.css('.generic-error')).getText()).toBe('You\'ve entered an incorrect email address or password.');
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
      expect(element(by.id('userslistpanel')).isDisplayed()).toBe(true);
    });

  }); //State is logged-in

  // Navigation bar
  describe('Navigation Bar', function() {
    it('should still be logged in', function() {
      expect(browser.driver.isElementPresent(by.id('setting-bar'))).toBe(true);
      expect(browser.driver.isElementPresent(by.id('feedback-btn'))).toBe(true);
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
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toBe('Please enter valid user email(s).');
          browser.sleep(500);
          element(by.css('.fa-times')).click();
        });
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
          element(by.css('.fa-times')).click();
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
        browser.sleep(500); //for the animation
        element(by.css('.alertify-log-error')).click();
        browser.sleep(500); //for the animation
        element.all(by.css('.panel-danger-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain(testuser.username);
          expect(rows[0].getText()).toContain('already exists');
          browser.sleep(500);
          element(by.css('.fa-times')).click();
          browser.sleep(500);
        });
      });
    });

    describe('Cancel', function() {
      it('should clear user input field and error message', function() {
        element(by.id('btnCancel')).click();
        element(by.id('usersfield')).getText().then(function(input) {
          expect(input).toBe('');
        });
      });
    });

    describe('Add a new user', function() {
      var inputEmail = utils.randomTestEmail();
      it('should display input user email in results with success message', function() {
        element(by.id('usersfield')).clear();
        element(by.id('usersfield')).sendKeys(inputEmail);
        element(by.id('btnAdd')).click();
        browser.sleep(1000);
        element(by.css('.alertify-log-success')).click();
        browser.sleep(500); //for the animation
        element.all(by.css('.panel-success-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain(inputEmail);
          expect(rows[0].getText()).toContain('added successfully');
          browser.sleep(500);
          element(by.css('.fa-times')).click();

        });
      });

      it('should delete added user', function() {
        deleteUtils.deleteUser(inputEmail).then(function(message) {
          expect(message).toEqual(200);
        }, function(data) {
          expect(data.status).toEqual(200);
        });
      });
    });
  });

  describe('Validate user page', function() {
    // it('should have a tab bar', function() {
    //   expect(element(by.id('tabs')).isDisplayed()).toBe(true);
    //   element.all(by.repeater('tab in tabs')).then(function(tabCount) {
    //     expect(tabCount.length).toBe(10);
    //   });
    // });

    it('clicking on home tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Home"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/users');
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
        expect(element(by.id('orgTitle')).isDisplayed()).toBe(true);
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
