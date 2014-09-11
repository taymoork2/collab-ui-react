'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-sso-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

describe('Enabling SSO flow', function() {
  // Logging in. Write your tests after the login flow is complete.
  describe('Login as sso admin user', function() {

    it('should login', function(){
      login.loginSSO(testuser.username, testuser.password);
    });

    xit('should redirect to CI global login page.', function() {
      browser.get('#/login');
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.css('#IDToken1'));
      }).then(function() {
        expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
      });
    });

    xit('should log in with valid admin user and display home page', function() {
      browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
      browser.driver.findElement(by.css('#IDButton2')).click();
      browser.sleep(500);
      browser.driver.findElement(by.css('#username')).sendKeys(testuser.username);
      browser.driver.findElement(by.css('#password')).sendKeys(testuser.password);
      browser.driver.findElement(by.css('button[type="submit"]')).click();
      browser.sleep(1000);
      expect(browser.getCurrentUrl()).toContain('/home');
    });

  }); //State is logged-in

  describe('Manage tab - SSO flow', function() {
    it('clicking on manage tab should change the view', function() {
      element(by.css('li[heading="Manage"]')).click();
      browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.id('tabs'));
      }).then(function() {
        expect(browser.getCurrentUrl()).toContain('/orgs');
      });
    });

    it('should display setup SSO button and clicking it should launch the wizard', function() {
      expect(element(by.id('btnSSO')).isDisplayed()).toBe(true);
      element(by.id('btnSSO')).click().then(function() {
        browser.sleep(1000);
        expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
      });
    });

    it('should display the Import IDP meatadata step when the wizard launches', function() {
      expect(element(by.id('fileToUploadText')).isDisplayed()).toBe(true);
      expect(element(by.id('fileToUploadBtn')).isDisplayed()).toBe(true);
      expect(element(by.id('fileToUploadTextHolder')).isDisplayed()).toBe(false);
      expect(element(by.id('fileToUploadBtnHolder')).isDisplayed()).toBe(false);
      expect(element(by.id('importCancelBtn')).isDisplayed()).toBe(true);
      expect(element(by.id('importNextBtn')).isDisplayed()).toBe(true);
    });

    it('should close the wizard when Cancel button is clicked', function() {
      element(by.id('importCancelBtn')).click().then(function() {
        browser.sleep(500);
        expect(element(by.id('btnSSO')).isDisplayed()).toBe(true);
      });
    });

    it('should navigate steps by clicking on Next and Previous buttons', function() {
      element(by.id('btnSSO')).click().then(function() {
        browser.sleep(500);
        element(by.id('importNextBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('downloadMeta')).isDisplayed()).toBe(true);
          expect(element(by.id('exportCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('exportBackBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('exportNextBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
        element(by.id('exportNextBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('ssoTestBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoBackBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoNextBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
        element(by.id('testssoNextBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('enablessoCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('enablessoBackBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('enablessoFinishBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
        element(by.id('enablessoBackBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('ssoTestBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoBackBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('testssoNextBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
        element(by.id('testssoBackBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('downloadMeta')).isDisplayed()).toBe(true);
          expect(element(by.id('exportCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('exportBackBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('exportNextBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
        element(by.id('exportBackBtn')).click().then(function() {
          browser.sleep(500);
          expect(element(by.id('fileToUploadText')).isDisplayed()).toBe(true);
          expect(element(by.id('fileToUploadBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('importCancelBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('importNextBtn')).isDisplayed()).toBe(true);
          expect(element(by.id('ssoModalHeader')).isDisplayed()).toBe(true);
        });
      });
    });

    it('should close the wizard when clicking on the X mark', function() {
      element(by.id('closeSSOModal')).click().then(function() {
        expect(element(by.id('btnSSO')).isDisplayed()).toBe(true);
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
