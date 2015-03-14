'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */

//test link: http://127.0.0.1:8000/#/login?pp=support_search:5354d535-9aaf-5e22-a091-34de878d2200

describe('Support flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors(this.getFullName());
  });

  describe('Support tab', function () {
    it('should login as non-sso admin user', function () {
      login.login('pbr-admin-test', '#/support');
    });

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.usersTab);
      utils.expectIsDisplayed(navigation.devicesTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
      utils.expectIsDisplayed(navigation.developmentTab);
      expect(navigation.getTabCount()).toBe(7);
    });

    it('should not display results panel initially', function () {
      utils.expectIsNotDisplayed(support.logsPanel);
    });

    it('should display error for empty input', function () {
      utils.click(support.logSearchBtn);
      notifications.assertError('Search input cannot be empty.');
    });

    it('should search for logs by valid email address', function (done) {
      support.searchAndVerifyResult(support.searchValidEmail);

      utils.expectIsDisplayed(support.supportTable);
      utils.expectIsDisplayed(support.emailAddress);
      utils.expectText(support.emailAddress, support.searchValidEmail);

      utils.click(support.locusIdSort);
      utils.click(support.locusIdSort);
      support.locusId.getText().then(function (locusId) {
        support.searchValidLocusid = locusId;
        done();
      });
    });

    it('should search for logs by valid uuid', function () {
      support.searchAndVerifyResult(support.searchValidUuid, support.searchValidEmail);

      utils.expectIsDisplayed(support.supportTable);
      utils.expectIsDisplayed(support.emailAddress);
      utils.expectText(support.emailAddress.getText(), support.searchValidEmail);
    });

    xit('should search for logs by valid locusId', function () {
      support.searchAndVerifyResult(support.searchValidLocusid, support.searchValidEmail);
      utils.expectIsDisplayed(support.supportTable);

      utils.expectIsDisplayed(support.locusId);
      utils.expectText(support.locusId.getText(), support.searchValidLocusid);
      expect(support.callStart.getText()).not.toBe('-NA-');
    });

    xit('should display call-info panel for the log', function () {
      utils.click(support.callInfoIcon);
      utils.expectIsDisplayed(support.closeCallInfo);
    });

    it('should display log-list panel on search', function () {
      utils.click(support.logSearchBtn);
      utils.expectIsNotDisplayed(support.closeCallInfo);
      utils.expectIsDisplayed(support.supportTable);
    });

    xit('should search for logs by valid email address and display log info', function () {
      support.searchAndVerifyResult(support.searchValidEmail);
    });

    xit('should display log info', function () {
      utils.click(support.callInfoIcon);
      utils.expectIsDisplayed(support.closeCallInfo);

      utils.click(support.closeCallInfo);
      utils.expectIsNotDisplayed(support.closeCallInfo);

      utils.expectIsDisplayed(support.downloadCallflowChartsIcon);
      utils.expectIsDisplayed(support.logsPanel);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Non-admin Squared Support Role', function () {
    it('should login as squared support user', function () {
      login.login('support-admin', '#/support');
    });

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
      expect(navigation.getTabCount()).toBe(3);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
