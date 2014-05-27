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
      //This button is now covered by another <ins> element.
      //expect(element(by.id('btn_callInit')).isDisplayed()).toEqual(true);
      expect(element(by.id('btnAdd')).isDisplayed()).toEqual(true);
    });

  }); //State is logged-in

  // Asserting listing users.
  describe('Listing users on page load', function() {
    it('should show first page of users', function() {
      expect(element(by.css('.pagination-current a')).getText()).toBe('1');
    });
    it('should list 20 or less users', function() {
      element.all(by.repeater('user in queryuserslist')).then(function(rows) {
        expect(rows.length).toBeLessThanOrEqualTo(20);
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

  // Add User
  describe('Add User', function() {
    var inputEmail;
    var inputTitle = 'EngTest';
    var inputLastName = 'testLastName';

    it('should add user successfully and increase user count', function() {
      inputEmail = randomId() + '@example.com';
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
              element(by.css('.fa-times')).click();
            });

            element(by.id('search-input')).sendKeys(inputEmail).then(function() {

              setTimeout(function() {
                browser.wait(function() {
                  element.all(by.repeater('user in queryuserslist')).then(function(rows) {
                    expect(rows.length).toBe(1);

                    //check user profile
                    element(by.css('td a')).click();
                    //validate buttons and log panel is visible
                    expect(element(by.id('btnRequestLogs')).isDisplayed()).toEqual(true);
                    expect(element(by.id('btnDeleteUser')).isDisplayed()).toEqual(true);
                    expect(element(by.id('btnResetPwd')).isDisplayed()).toEqual(true);
                    expect(element(by.id('userSupport')).isDisplayed()).toEqual(true);
                    //validate user profile is for correct user
                    expect(element(by.id('fnameField')).isDisplayed()).toEqual(true);
                    expect(element(by.id('lnameField')).isDisplayed()).toEqual(true);
                    expect(element(by.id('emailField')).isDisplayed()).toEqual(true);

                    expect(element(by.id('emailField')).getText()).toBe(inputEmail);

                    //edit user profile fields and save
                    element(by.id('titlefield')).sendKeys(inputTitle);
                    element(by.id('lnamefield')).sendKeys(inputLastName);
                    element(by.id('btnSave')).click().then(function() {
                      browser.wait(function() {
                        browser.sleep(500);
                        //verify data is there
                        expect(element(by.id('lnameField'))).toEqual(inputLastName);
                        expect(element(by.id('titleField'))).toEqual(inputTitle);

                        //verify success message
                        element(by.css('.alertify-log-success')).click();
                        element.all(by.css('.panel-success-body p')).then(function(rows) {
                          expect(rows[0].getText()).toContain(inputEmail);
                          expect(rows[0].getText()).toContain('added successfully');
                        });
                      });
                    });

                    element(by.id('usertab')).click();
                  });
                });
              }, 3000); //timeout

            }); //end search
          }); //end add
        });
      });
    });
  });

  // Update entitlements
  describe('Updating entitlements', function() {
    it('should display initial entitlements from newly added user', function() {
      browser.sleep(1000);
      element(by.css('.caret')).click();
      element(by.css('.btn-group li')).click();
      var modal = element(by.css('.modal-content'));
      expect(modal.isPresent()).toBe(true);
      modal.element.all(by.css('.icheckbox_square-blue')).then(function(items) {
        expect(items.length).toBe(3);
        expect(items[0].getAttribute('class')).toContain('checked');
        expect(items[2].getAttribute('class')).toContain('checked');
      });
      element(by.css('button.close')).click();
    });
  });

  // Ignoring this last logout() to avoid protractor synchronization issues.
  // Warning: Only do this if this is the last test in the suite.
  // // Log Out
  // describe('Log Out', function() {
  //   it('should log out', function() {
  //     element(by.id('setting-bar')).click().then(function(){
  //       element(by.id('logout-btn')).click();
  //       browser.ignoreSynchronization = true;
  //     });
  //   });
  // });
});
