'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

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

describe('Entitle flow', function() {

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as sso admin user', function() {

    it('should redirect to CI global login page.', function() {
      browser.get('#/login');
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
      });
    });

    it('should log in with valid sso admin user and display users page', function() {
      browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.ssousername);
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

  // Navigation bar
  describe('Navigation Bar', function() {
    it('should still be logged in', function() {
      expect(browser.driver.isElementPresent(by.css('#logout-btn'))).toBe(true);
    });

    it('should display the sso username and the orgname', function() {
      expect(element(by.binding('username')).getText()).toContain(testuser.ssousername);
      expect(element(by.binding('orgname')).getText()).toContain(testuser.orgname);
    });

  });

  // Entitle User Flows: state is in the users page
  describe('Entitle User Flows', function() {

    describe('Page initialization', function() {

      it('should initialize users page for entitling users', function() {
        expect(element(by.id('subTitleAdd')).isDisplayed()).toBe(false);
        expect(element(by.id('subTitleEnable')).isDisplayed()).toBe(true);
        expect(element(by.id('subTitleEnable')).getText()).toBe('Entitle users');
        expect(element(by.id('btnAdd')).isDisplayed()).toBe(false);
        expect(element(by.id('btnEntitle')).isDisplayed()).toBe(true);
      });

      it('should display error if no user is entered', function() {
        element(by.id('btnEntitle')).click();
        var result = element(by.repeater('userResult in results.resultList').row(0));
        expect(result.getText()).toBe('Please enter valid user email(s).');
      });

    });

    describe('Entitle an existing user', function() {
      it('should display input user email in results with success message', function() {
        element(by.id('usersfield')).clear();
        element(by.id('usersfield')).sendKeys(testuser.username);
        element(by.id('btnEntitle')).click();
        element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain(testuser.username);
          expect(rows[0].getText()).toContain('entitled successfully');
        });
      });
    });

    describe('Entitle non-existing user', function() {
      it('should display input user email in results with error message', function() {
        var inputEmail = randomId() + '@example.com';
        element(by.id('usersfield')).clear();
        element(by.id('usersfield')).sendKeys(inputEmail);
        element(by.id('btnEntitle')).click();
        element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain(inputEmail);
          expect(rows[0].getText()).toContain('does not exist');
        });
      });
    });

    // describe('Add multiple users separated with commas and semicolons', function() {
    //   it('should display input user email in results', function() {
    //     var randomEmail = randomId() + '@example.com';
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

  // Log Out
  describe('Log Out', function() {
    it('should redirect to login page', function() {
      element(by.css('#logout-btn')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbrokerbeta.webex.com');
      });
    });

  });


});
