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
  orgname: 'SquaredAdminTool',
  usernameWithNoEntitlements: 'doNotDeleteTestUser@wx2.example.com'
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

    it('should log in with valid credentials and display home page', function() {

      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken2'));
      }).then(function() {
        browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
        browser.driver.findElement(by.css('#Button1')).click();
      });

      expect(browser.getCurrentUrl()).toContain('/home');
    });

  }); //State is logged-in

  //Test which tabs are present
  it('should display correct tabs for user based on role', function() {
    expect(element(by.css('li[heading="Home"]')).isDisplayed()).toBe(true);
    expect(element(by.css('li[heading="Users"]')).isDisplayed()).toBe(true);
    expect(element(by.css('li[heading="Manage"]')).isDisplayed()).toBe(true);
    expect(element(by.css('li[heading="Reports"]')).isDisplayed()).toBe(true);
  });

  it('clicking on users tab should change the view', function() {
    element(by.css('li[heading="Users"]')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('tabs'));
    }).then(function() {
      expect(browser.getCurrentUrl()).toContain('/users');
    });
  });

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
      it('click on invite subtab should show add users', function() {
        element(by.id('addUsers')).click();
        expect(element(by.id('userslistpanel')).isDisplayed()).toEqual(false);
        expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(true);
      });

      it('should initialize users page for add/entitle/invite users', function() {
        expect(element(by.id('subTitleAdd')).isDisplayed()).toBe(true);
        expect(element(by.id('subTitleEnable')).isDisplayed()).toBe(false);
        expect(element(by.id('subTitleAdd')).getText()).toBe('Manage users');
        expect(element(by.id('btnAdd')).isDisplayed()).toBe(true);
        expect(element(by.id('btnEntitle')).isDisplayed()).toBe(true);
        expect(element(by.id('btnInvite')).isDisplayed()).toBe(true);
      });

      it('should display error if no user is entered on add', function() {
        element(by.id('btnAdd')).click();
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toBe('Please enter valid user email(s).');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
          browser.sleep(500);
        });
      });

      it('should display error if no user is entered on update', function() {
        element(by.id('btnEntitle')).click();
        browser.sleep(500);
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toBe('Please enter valid user email(s).');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
          browser.sleep(500);
        });
      });

      it('should display error if no user is entered on invite', function() {
        element(by.id('btnInvite')).click();
        browser.sleep(500);
        element(by.css('.alertify-log-error')).click().then(function() {
          browser.sleep(500);
          expect(element(by.css('.panel-danger-body p')).getText()).toBe('Please enter valid user email(s).');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
          browser.sleep(500);
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
          expect(element(by.id('btnEntitle')).getAttribute('disabled')).toBe(null);
          expect(element(by.id('btnInvite')).getAttribute('disabled')).toBe(null);
          element(by.css('.close')).click();
          browser.sleep(1000);
          element(by.id('small-notification-cancel')).click();
        }
      });
      it('should invalidate token with invalid inputs and disable button', function() {
        for (var i = 0; i < invalidinputs.length; i++) {
          element(by.id('usersfield')).clear();
          element(by.id('usersfield')).sendKeys(invalidinputs[i]);
          element(by.id('usersfield')).sendKeys(protractor.Key.ENTER);
          expect(element(by.css('.invalid')).isPresent()).toBe(true);
          expect(element(by.id('btnAdd')).getAttribute('disabled')).toBe('true');
          expect(element(by.id('btnEntitle')).getAttribute('disabled')).toBe('true');
          expect(element(by.id('btnInvite')).getAttribute('disabled')).toBe('true');
          element(by.css('.close')).click();
          //browser.sleep(1000);
          //element(by.id('small-notification-cancel')).click();
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
          element(by.id('notifications-cancel')).click();
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
          element(by.id('notifications-cancel')).click();

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

  describe('Invite users', function() {
    it('should invite users successfully', function() {
      var inviteEmail = utils.randomTestEmail();
      element(by.id('usersfield')).clear();
      element(by.id('usersfield')).sendKeys(inviteEmail).then(function() {
        element(by.id('btnInvite')).click();
        browser.sleep(3000); //for the animation
        element(by.css('.alertify-log-success')).click();
        browser.sleep(500); //for the animation
        element.all(by.css('.panel-success-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain('sent successfully');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
        });
      });
    });

    it('should not invite users successfully if they are already entitled', function() {
      var inviteEmail = testuser.username;
      element(by.id('usersfield')).clear();
      element(by.id('usersfield')).sendKeys(inviteEmail).then(function() {
        element(by.id('btnInvite')).click();
        browser.sleep(1000); //for the animation
        element(by.css('.alertify-log-error')).click();
        browser.sleep(500); //for the animation
        element.all(by.css('.panel-danger-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain('already entitled');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
        });
      });
    });

    it('should not invite users successfully from org which has autoentitlement flag disabled', function() {
      var inviteEmail = testuser.usernameWithNoEntitlements;
      element(by.id('usersfield')).clear();
      element(by.id('usersfield')).sendKeys(inviteEmail).then(function() {
        element(by.id('btnInvite')).click();
        browser.sleep(1000); //for the animation
        element(by.css('.alertify-log-error')).click();
        browser.sleep(500); //for the animation
        element.all(by.css('.panel-danger-body p')).then(function(rows) {
          expect(rows.length).toBe(1);
          expect(rows[0].getText()).toContain('cannot be invited to service');
          browser.sleep(500);
          element(by.id('notifications-cancel')).click();
          element(by.id('closeAddUser')).click();
          browser.sleep(500);
        });
      });
    });
  });

  describe('Users preview panel', function() {

      it('should show the squared entitlement column on first load', function() {
            expect(element(by.id('entitlementCol')).isDisplayed()).toEqual(true);
      });

      it('should show the preview panel when clicking on a user', function() {
        element(by.id('userNameCell')).click().then(function(){           
          expect(element(by.id('entitlementCol')).isDisplayed()).toEqual(false);
          expect(element(by.id('details-panel')).isDisplayed()).toEqual(true);
        });
      });

      it('should exit the preview panel when clicking the x', function() {
          element(by.id('exitPreviewButton')).click().then(function(){           
          expect(element(by.id('entitlementCol')).isDisplayed()).toEqual(true);
          expect(element(by.id('details-panel')).isDisplayed()).toEqual(false);
      });
  });

    });

  describe('Switching tabs', function() {
    it('should have a tab bar', function() {
      expect(element(by.id('tabs')).isDisplayed()).toBe(true);
      element.all(by.repeater('tab in tabs')).then(function(tabCount) {
        expect(tabCount.length).toBe(10);
      });
    });

    it('clicking on home tab should change the view', function() {
      element(by.css('li[heading="Home"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/home');
        expect(element(by.id('Conversations')).isDisplayed()).toBe(true);
        expect(element(by.id('Mobile Clients')).isDisplayed()).toBe(true);
        expect(element(by.id('Web Client')).isDisplayed()).toBe(true);
        expect(element(by.id('activeUsersChart')).isDisplayed()).toBe(true);
        expect(element(by.id('au-content')).isDisplayed()).toBe(true);
        expect(element(by.id('calls-content')).isDisplayed()).toBe(true);
        expect(element(by.id('convo-content')).isDisplayed()).toBe(true);
        expect(element(by.id('share-content')).isDisplayed()).toBe(true);
        expect(element(by.css('.home-setup-panel')).isDisplayed()).toBe(true);

        element(by.id('btnQuickSetup')).click().then(function(){
          browser.sleep(1000);
          expect(element(by.id('chk_invite')).isDisplayed()).toBe(true);
          element(by.id('chk_invite')).click().then(function(){
            expect(element(by.id('btnQuickSetupAction')).getText()).toEqual('Next');
            element(by.id('btnQuickSetupAction')).click().then(function(){
              expect(browser.getCurrentUrl()).toContain('/users');
            });
          });
        });
      });
    });

    it('clicking on system health panel should open to status page in a new tab', function() {
      element(by.css('li[heading="Home"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        var appWindow = browser.getWindowHandle();
        element(by.css('.monitoring-cell')).click().then(function(){
          browser.sleep(3000);
          browser.getAllWindowHandles().then(function (handles) {
            browser.sleep(1500);
            var newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
              expect(browser.driver.getCurrentUrl()).toContain('status.squaredpreview.com/');
            });
            browser.driver.close().then(function () {
              browser.switchTo().window(appWindow);
            });
            browser.sleep(500);
          });
        });
      });
    });

    it('clicking on orgs tab should change the view', function() {
      element(by.css('li[heading="Manage"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/orgs');
        expect(element(by.id('orgTitle')).isDisplayed()).toBe(true);
        expect(element(by.id('displayName')).isDisplayed()).toEqual(true);
        expect(element(by.id('estimatedSize')).isDisplayed()).toEqual(true);
        expect(element(by.id('totalUsers')).isDisplayed()).toEqual(true);
        expect(element(by.id('sso')).isDisplayed()).toEqual(true);
        expect(element(by.id('btnSave')).isDisplayed()).toEqual(false);
        expect(element(by.id('btnReset')).isDisplayed()).toEqual(true);
      });
    });

    it('clicking on reports tab should change the view', function() {
      element(by.css('li[heading="Reports"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/reports');
        expect(element(by.id('avgEntitlementsdiv')).isDisplayed()).toBe(true);
        expect(element(by.id('avgCallsdiv')).isDisplayed()).toBe(true);
        expect(element(by.id('avgConversationsdiv')).isDisplayed()).toBe(true);
        expect(element(by.id('activeUsersdiv')).isDisplayed()).toBe(true);
        expect(element(by.id('avg-entitlements-refresh')).isDisplayed()).toBe(true);
        expect(element(by.id('avg-calls-refresh')).isDisplayed()).toBe(true);
        expect(element(by.id('avg-conversations-refresh')).isDisplayed()).toBe(true);
        expect(element(by.id('active-users-refresh')).isDisplayed()).toBe(true);
      });
    });

    it('clicking on users tab should change the view', function() {
      element(by.css('li[heading="Users"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/users');
      });
    });
  });

  describe('Home data refresh', function() {

    it('should load refresh directive template', function() {
        element(by.css('li[heading="Home"]')).click();
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function(){
          expect(element(by.id('homeRefreshData')).isDisplayed()).toEqual(true);
          expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
        });
      });

    it('should load cached values into directive when switching tabs', function() {
        element(by.css('li[heading="Users"]')).click();
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.id('tabs'));
        }).then(function(){
          element(by.css('li[heading="Home"]')).click();
          browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.id('tabs'));
        }).then(function(){
            expect(element(by.id('homeRefreshData')).isDisplayed()).toEqual(true);
            expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
            expect(element(by.id('au-content')).isDisplayed()).toEqual(true);
            expect(element(by.id('calls-content')).isDisplayed()).toEqual(true);
            expect(element(by.id('convo-content')).isDisplayed()).toEqual(true);
            expect(element(by.id('share-content')).isDisplayed()).toEqual(true);
            expect(element(by.id('activeUsersChart')).isDisplayed()).toEqual(true);
          });
        });
      });

    it('should load new values and update time when clicking refresh', function() {
      browser.driver.findElement(by.id('refreshButton')).click().then(function() {
          expect(element(by.id('homeRefreshData')).isDisplayed()).toEqual(true);
          expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
          expect(element(by.id('au-content')).isDisplayed()).toEqual(true);
          expect(element(by.id('calls-content')).isDisplayed()).toEqual(true);
          expect(element(by.id('convo-content')).isDisplayed()).toEqual(true);
          expect(element(by.id('share-content')).isDisplayed()).toEqual(true);
          expect(element(by.id('activeUsersChart')).isDisplayed()).toEqual(true);
        });
      });
     
    });

    describe('Reports data refresh', function() {

      it('should load refresh directive template', function() {
        element(by.css('li[heading="Reports"]')).click();
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(by.id('tabs'));
        }).then(function(){
          expect(element(by.id('reportsRefreshData')).isDisplayed()).toEqual(true);
          expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
        });
      });

      it('should load cached values into directive when switching tabs', function() {
      //browser.sleep(3000);

        element(by.css('li[heading="Users"]')).click();
          browser.driver.wait(function() {
            return browser.driver.isElementPresent(by.id('tabs'));
          }).then(function(){
            element(by.css('li[heading="Reports"]')).click();
            browser.driver.wait(function() {
              return browser.driver.isElementPresent(by.id('tabs'));
            }).then(function(){
              expect(element(by.id('reportsRefreshData')).isDisplayed()).toEqual(true);
              expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
              expect(element(by.id('avgEntitlementsdiv')).isDisplayed()).toEqual(true);
              expect(element(by.id('avgConversationsdiv')).isDisplayed()).toEqual(true);
              expect(element(by.id('activeUsersdiv')).isDisplayed()).toEqual(true);
              expect(element(by.id('avgCallsdiv')).isDisplayed()).toEqual(true);
          });
        });
      });

      it('should load new values and update time when clicking refresh', function() {
        browser.driver.findElement(by.id('refreshButton')).click().then(function(){
          expect(element(by.id('reportsRefreshData')).isDisplayed()).toEqual(true);
          expect(element(by.id('lastReloadedTime')).isDisplayed()).toEqual(true);
          expect(element(by.id('avgEntitlementsdiv')).isDisplayed()).toEqual(true);
          expect(element(by.id('avgConversationsdiv')).isDisplayed()).toEqual(true);
          expect(element(by.id('activeUsersdiv')).isDisplayed()).toEqual(true);
          expect(element(by.id('avgCallsdiv')).isDisplayed()).toEqual(true);

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
