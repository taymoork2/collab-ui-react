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

var utils = require('./testUtils.js');
var deleteUtils = require('./deleteUtils.js');

var inputEmail;

// Notes:
// - State is conserved between each despribe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('List users flow', function() {
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

  // Asserting listing users.
  describe('Listing users on page load', function() {

    it('clicking on users tab should change the view', function() {
      browser.driver.findElement(by.css('li[heading="Users"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/users');
        //check to make sure add users panel is not visible
        expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(false);
      });
    });

    it('should show first page of users', function() {
      expect(element(by.css('.pagination-current a')).getText()).toBe('1');
    });

    it('should list 20 or less users', function() {
      element.all(by.repeater('user in queryuserslist')).then(function(rows) {
        expect(rows.length).toBeLessThanOrEqualTo(20);
      });
    });
  });

  // Asserting pagination of users.
  describe('Paginating users returned', function() {
    it('should paginate the total number of users', function() {
      //pagination is only relevant if total matches exceeds 20
      //Initial page
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
    });
  });

  // Asserting sorting of users.
  describe('Sorting users', function() {
    it('should sort users by name', function() {
      element(by.id('queryresults')).getAttribute('value').then(function(value) {
        var queryresults = parseInt(value, 10);
        if (queryresults > 1) {
          //get first user
          var user = null;
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            user = rows[0].getText();
          });
          //Click on name sort and expect the first user not to be the same
          element(by.id('name-sort')).click().then(function() {
            element.all(by.repeater('user in queryuserslist')).then(function(rows) {
              expect(rows[0].getText()).not.toBe(user);
            });
          });
        }
      });
    });

    it('should sort users by username', function() {
      element(by.id('queryresults')).getAttribute('value').then(function(value) {
        var queryresults = parseInt(value, 10);
        if (queryresults > 1) {
          //get first user
          var user = null;
          element.all(by.repeater('user in queryuserslist')).then(function(rows) {
            user = rows[0].getText();
          });
          //Click on username sort and expect the first user not to be the same
          element(by.id('username-sort')).click().then(function() {
            element.all(by.repeater('user in queryuserslist')).then(function(rows) {
              expect(rows[0].getText()).not.toBe(user);
            });
          });
        }
      });
    });
  });

// Asserting search users.
  describe('search users on page', function() {
    it('should show first page of users based on search string', function() {
      element(by.id('search-input')).sendKeys(testuser.searchStr).then(function() {
        browser.sleep(1000);
        element(by.id('queryresults')).getAttribute('value').then(function(value) {
          var queryresults = parseInt(value, 10);
          if (queryresults > 0) {
            element(by.binding('user.userName')).getText().then(function(uname) {
              expect(uname).toContain(testuser.searchStr);
            });
          }
          element(by.id('search-input')).clear();
        });
      });
    });
  });

  // Add User
  describe('Add User', function() {
    it('click on invite subtab should show manage users', function () {
      browser.driver.findElement(by.id('addUsers')).click();
      expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(true);
      expect(element(by.id('usersfield')).isDisplayed()).toEqual(true);
      //This button is now covered by another <ins> element.
      //expect(element(by.id('btn_callInit')).isDisplayed()).toEqual(true);
      expect(element(by.id('btnAdd')).isDisplayed()).toEqual(true);
    });

    it('should add user successfully and increase user count', function() {
      inputEmail = utils.randomTestEmail();

      element(by.id('usersfield')).clear();
      element(by.id('usersfield')).sendKeys(inputEmail).then(function() {
        //entitle for call initiation
        element(by.css('.iCheck-helper')).click().then(function() {
          element(by.id('btnAdd')).click().then(function() {
            browser.sleep(500);
            element(by.css('.alertify-log-success')).click();
            element.all(by.css('.panel-success-body p')).then(function(rows) {
              expect(rows[0].getText()).toContain(inputEmail);
              expect(rows[0].getText()).toContain('added successfully');
              browser.sleep(500);
              element(by.id('notifications-cancel')).click();
              browser.sleep(500);
              element(by.id('closeAddUser')).click();
              browser.sleep(500);
            });

            element(by.id('search-input')).sendKeys(inputEmail).then(function() {
              browser.sleep(1000);

              element.all(by.repeater('user in queryuserslist')).then(function(rows) {
                expect(rows.length).toBe(1);
                //check user profile
                element(by.id('userNameCell')).click();
                browser.sleep(1000);
                //validate user profile is for correct user
                expect(element(by.id('details-panel')).isDisplayed()).toEqual(true);
                expect(element(by.id('name-preview')).isDisplayed()).toEqual(true);
                element(by.id('exitPreviewButton')).click();
              });
            }); //end search
          }); //end add
        });
      });
    });
  });

  /* UNCOMMENT WHEN BACKEND IS PUSHED TO PROD */
  //Update entitlements
  describe('Updating entitlements', function() {
    it('should display initial entitlements from newly added user', function() {
      element(by.id('search-input')).clear();
      browser.sleep(500);
      element(by.id('search-input')).sendKeys(inputEmail).then(function() {
        browser.sleep(1000);
        element(by.binding('user.userName')).getText().then(function(uname) {
          expect(uname).toContain(inputEmail);
        });
        element(by.binding('user.userName')).click();
        browser.sleep(500);
        element(by.id('squaredPanel')).click();
        browser.sleep(500);
        element.all(by.css('.details-body .icheckbox_square-blue')).then(function(items) {
          expect(items.length).toBe(8);
          expect(items[0].getAttribute('class')).toContain('checked');
          expect(items[7].getAttribute('class')).toContain('checked');
        });
        browser.sleep(500);
        element(by.id('chk_squaredFusionUC')).click();
        browser.sleep(500);
        element(by.id('btnSave')).click();
        browser.sleep(2000);
        browser.debugger();
        element(by.css('.alertify-log-success')).click();
        browser.sleep(500);
        element.all(by.css('.panel-success-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain(inputEmail);
          expect(rows[0].getText()).toContain('updated successfully');
          browser.sleep(500);
          element(by.css('.fa-times')).click();
        });
        element(by.id('exitPreviewButton')).click();
        browser.sleep(500);
      });
    });
  });

  describe('Exporting to CSV', function() {
    it('should display the CSV export button', function() {
      element(by.id('userMoreOptions')).click();
      browser.sleep(1000);
      expect(element(by.id('export-btn')).isDisplayed()).toBe(true);
    });
  });

  describe('Clean up added user', function() {
    it('should delete added user', function() {
      deleteUtils.deleteUser(inputEmail).then(function(message) {
        expect(message).toEqual(200);
      }, function(data) {
        expect(data.status).toEqual(200);
      });
    });
  });

  //Log Out
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
