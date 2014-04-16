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

function randomId() {
  return (Math.random() + 1).toString(36).slice(2);
}

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
      //check to make sure add users panel is visible
      expect(element(by.id('usersfield')).isDisplayed()).toEqual(true);
      expect(element(by.id('btn_callInit_on')).isDisplayed()).toEqual(true);
      expect(element(by.id('btnAdd')).isDisplayed()).toEqual(true);
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

  // Asserting search users.
  describe('search users on page', function() {
    it('should show first page of users based on search string', function() {
      var initTotal = 0;
      var afterTotal = 0;
      element(by.id('totalresults')).getAttribute('value').then(function(value) {
        initTotal = parseInt(value, 10);
      });
      
      element(by.id('search-input')).sendKeys(testuser.searchStr).then(function() {
        element(by.id('totalresults')).getAttribute('value').then(function(value) {
          afterTotal = parseInt(value, 10);
          //TEST BROKEN DUE TO SCIM, UNCOMMENT LATER
          // expect(initTotal).toBeGreaterThan(afterTotal);
          // if (afterTotal > 0)
          // {
          //   element(by.binding('user.userName')).getText().then(function(uname) {
          //     expect(uname).toContain(testuser.searchStr);
          //   });
          // }
          element(by.id('search-input')).clear();
        });
      });

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
            element(by.id('search-input')).clear();
          });
        }
      });
    });
  });

  // Asserting sorting of users.
  describe('Sorting users', function() {
    it('should sort users by name', function() {
      element(by.id('totalresults')).getAttribute('value').then(function(value) {
        var totalresults = parseInt(value, 10);
        if (totalresults > 0) {
          //get first user
          var user = null;
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            user = rows[0].getText();
          });
          //Click on name sort and expect the first user not to be the same
          element(by.id('name-sort')).click().then(function() {
            //TEST BROKEN DUE TO SCIM, UNCOMMENT LATER
            // element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            //   expect(rows[0].getText()).not.toBe(user);
            // });
          });
        }
      });
    });
    it('should sort users by username', function() {
      element(by.id('username-sort')).click();
      element(by.id('totalresults')).getAttribute('value').then(function(value) {
        var totalresults = parseInt(value, 10);
        if (totalresults > 0) {
          //get first user
          var user = null;
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            user = rows[0].getText();
          });
          //Click on username sort and expect the first user to be last now
          element(by.id('username-sort')).click().then(function() {
            element(by.id('last-page')).click();
            //TEST BROKEN DUE TO SCIM, UNCOMMENT LATER
            // element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            //   expect(rows[rows.length-1].getText()).toBe(user);
            // });
          });
        }
      });
    });
  });

  // Add User
  describe('Add User', function() {

    it('should add user successfully and increase user count', function() {
      var initialCount;
      element(by.id('totalresults')).getAttribute('value').then(function(count) {
        initialCount = parseInt(count, 10);
      });
      var inputEmail = randomId() + '@example.com';
      element(by.id('usersfield')).clear();
      element(by.id('usersfield')).sendKeys(inputEmail);
      element(by.id('btnAdd')).click();

      //TEST BROKEN DUE TO SCIM, UNCOMMENT LATER
      // element.all(by.repeater('userResult in results.resultList')).then(function(rows) {
      //   expect(rows.length).toBe(1);
      //   expect(rows[0].getText()).toContain(inputEmail);
      //   expect(rows[0].getText()).toContain('added successfully');
      //   element(by.id('totalresults')).getAttribute('value').then(function(count) {
      //     expect(parseInt(count, 10)).toBeGreaterThan(initialCount);
      //   });
      // });
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
