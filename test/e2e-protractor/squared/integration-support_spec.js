'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

//test link: http://127.0.0.1:8000/#/login?pp=support_search:5354d535-9aaf-5e22-a091-34de878d2200

var testuser = {
  username: 'pbr-org-admin-test@wx2.example.com',
  password: 'C1sc0123!',
  orgname: 'SquaredAdminTool',
  searchValidEmail: 'pbr-org-admin@squared2webex.com',
  searchValidUuid: 'd6688fc9-414d-44ce-a166-759530291edc',
  searchValidLocusid: '',
  searchNonexistentMetadata: 'qqt7y812twuiy900909-2jijeqbd,,.mjmj123qwsah77&89%$3wesa@54a'
};

var supportuser = {
  username: 'sqtest-admin-support@squared.example.com',
  password: 'C1sc0123!',
};

describe('Support flow', function() {

  describe('Support tab', function() {
    it('should login as non-sso admin user', function(){
      login.login(testuser.username, testuser.password);
    });

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(6);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.usersTab.isDisplayed()).toBeTruthy();
      expect(navigation.devicesTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
      expect(navigation.developmentTab.isDisplayed()).toBeTruthy();
    });
    //Test if Support tab is present
    it('should display correct tabs for user based on role', function() {
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
    });

    it('clicking on support tab should change the view', function() {
      navigation.clickSupport();
    });

    it('should not display results panel initially', function() {
      expect(support.logsPanel.isDisplayed()).toBeFalsy();
    });

    it('should display error for empty input', function() {
      support.logSearchBtn.click();
      notifications.assertError('Search input cannot be empty.');
    });

    it('should search for logs by valid email address', function() {
      support.logSearchField.clear();
      support.logSearchField.sendKeys(testuser.searchValidEmail);
      support.logSearchBtn.click();
      support.assertResultsLength(0);
      expect(support.supportTable.isDisplayed()).toBeTruthy();
      expect(support.emailAddress.getText()).toBe(testuser.searchValidEmail);
      support.locusIdSort.click();
      support.locusIdSort.click();
      testuser.searchValidLocusid = support.locusId.getText();
    });

    it('should search for logs by valid uuid', function() {
      support.logSearchField.clear();
      support.logSearchField.sendKeys(testuser.searchValidUuid);
      support.logSearchBtn.click();
      support.assertResultsLength(0);
      expect(support.supportTable.isDisplayed()).toBeTruthy();

      expect(support.emailAddress.getText()).toBe(testuser.searchValidEmail);
    });

    // TODO: Disabled by stimurbe Thu Feb 12 2015 13:26:54 GMT+0100 (CET)
    xit('should search for logs by valid locusId', function() {
      support.logSearchField.clear();
      support.logSearchField.sendKeys(testuser.searchValidLocusid);
      support.logSearchBtn.click();
      support.assertResultsLength(0);
      expect(support.supportTable.isDisplayed()).toBeTruthy();

      expect(support.locusId.getText()).toBe(testuser.searchValidLocusid);
      expect(support.callStart.getText()).not.toBe('-NA-');
    });

    // TODO: Disabled by stimurbe Thu Feb 12 2015 13:26:54 GMT+0100 (CET)
    xit('should display call-info panel for the log', function() {
      support.callInfoIcon.click();
      expect(support.closeCallInfo.isDisplayed()).toBeTruthy();
    });

    it('should display log-list panel on search', function() {
      support.logSearchBtn.click();
      expect(support.closeCallInfo.isDisplayed()).toBeFalsy();
      expect(support.supportTable.isDisplayed()).toBeTruthy();
    });

    it('should not return results for non existent metadata search', function() {
      support.logSearchField.clear();
      support.logSearchField.sendKeys(testuser.searchNonexistentMetadata);
      support.logSearchBtn.click();
      expect(support.noResults.getText()).toBe('No Results.');
    });

    it('should search for logs by valid email address and display log info', function() {
      support.logSearchField.clear();
      support.logSearchField.sendKeys(testuser.searchValidEmail);
      support.logSearchBtn.click();
      expect(support.supportTable.isDisplayed()).toBeTruthy();
      support.assertResultsLength(0);
      support.callInfoIcon.click();
      expect(support.closeCallInfo.isDisplayed()).toBeTruthy();
      support.closeCallInfo.click();
      expect(support.closeCallInfo.isDisplayed()).toBeFalsy();
      expect(support.downloadCallflowChartsIcon.isDisplayed()).toBeTruthy();
      expect(support.logsPanel.isDisplayed()).toBeTruthy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  // describe('Search via external link', function() {

  //   describe('Search via link when user not logged in', function() {

  //     it('should redirect to CI global login page.', function() {
  //       browser.get('#/login?pp=support_search:' + testuser.searchValidLocusid);
  //       browser.driver.wait(function() {
  //         return browser.driver.isElementPresent(by.css('#IDToken1'));
  //       }).then(function() {
  //         expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
  //       });
  //     });

  //     it('should log in with valid credentials and redirect to support page', function() {
  //       browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
  //       browser.driver.findElement(by.css('#IDButton2')).click();
  //       browser.driver.wait(function() {
  //         return browser.driver.isElementPresent(by.css('#IDToken2'));
  //       }).then(function() {
  //         browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
  //         browser.driver.findElement(by.css('#Button1')).click();
  //       });

  //       expect(browser.getCurrentUrl()).toContain('/support');
  //     });

  //     it('should populate search field from query param and search immediately', function() {
  //       browser.sleep(60000);
  //       element(by.id('logsearchfield')).getText().then(function(input) {
  //           expect(input).toBe(testuser.searchValidLocusid);
  //         });
  //       browser.sleep(3000);
  //       element.all(by.repeater('log in userLogs')).then(function(rows) {
  //         expect(rows.length).toBeGreaterThan(0);
  //         expect(element(by.binding('log.locusId')).getText()).toBe(testuser.searchValidLocusid);
  //         expect(element(by.binding('log.callStart')).getText()).not.toBe('-NA-');
  //       });
  //     });

  //   });

  //   describe('Search via external while user logged in', function() {

  //     it('switch to another tab first', function() {
  //       element(by.css('li[heading="Manage"]')).click();
  //       browser.driver.wait(function() {
  //         return browser.driver.isElementPresent(by.id('tabs'));
  //       }).then(function() {
  //         expect(browser.getCurrentUrl()).toContain('/orgs');
  //       });
  //     });

  //     it('search uuid via external link should redirect to support page and perform search', function() {
  //       browser.get('#/login?pp=support_search:' + testuser.searchValidUuid);
  //       expect(browser.getCurrentUrl()).toContain('/support');
  //       element(by.id('logsearchfield')).getText().then(function(input) {
  //           expect(input).toBe(testuser.searchValidUuid);
  //         });
  //       browser.sleep(3000);
  //       element.all(by.repeater('log in userLogs')).then(function(rows) {
  //         expect(rows.length).toBeGreaterThan(0);
  //         expect(element(by.binding('log.emailAddress')).getText()).toBe(testuser.searchValidEmail);
  //       });
  //     });

  //   });

  // });

  // // Log Out
  // describe('Log Out', function() {
  //   it('should log out', function() {
  //     element(by.id('setting-bar')).click();
  //     browser.driver.wait(function() {
  //       return browser.driver.isElementPresent(by.id('logout-btn'));
  //     }).then(function() {
  //       element(by.id('logout-btn')).click();
  //     });
  //   });
  // });

  describe('Non-admin Squared Support Role', function() {
    it('should login as squared support user', function(){
      login.login(supportuser.username, supportuser.password);
    });

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(3);
      expect(navigation.homeTab.isDisplayed()).toBeTruthy();
      expect(navigation.reportsTab.isDisplayed()).toBeTruthy();
      expect(navigation.supportTab.isDisplayed()).toBeTruthy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });
});
