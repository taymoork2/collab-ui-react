'use strict';

//test link: http://127.0.0.1:8000/#/login?pp=support_search:5354d535-9aaf-5e22-a091-34de878d2200

describe('Support flow', function () {
  var locusId;

  afterEach(function () {
    utils.dumpConsoleErrors();
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
      // utils.expectIsDisplayed(navigation.developmentTab);
    });

    it('should not display billing tab when support tab is clicked', function () {
      utils.click(navigation.supportTab);
      //utils.expectIsDisplayed(navigation.logsTab);
      utils.expectIsNotDisplayed(navigation.billingTab);
    });

    xit('should display error for empty input', function () {
      utils.click(navigation.logsPage);
      utils.click(support.logSearchBtn);
      notifications.assertError('Search input cannot be empty.');
    });

    // TODO these are environment specific logs and needs to be fixed
    if (!isProductionBackend) {
      xit('should search for logs by valid email address', function (done) {
        support.searchAndVerifyResult(support.searchValidEmail);

        utils.expectIsDisplayed(support.supportTable);
        utils.expectIsDisplayed(support.emailAddress);
        utils.expectText(support.rowContents, support.searchValidEmail);

        utils.click(support.locusIdSort);
        utils.click(support.locusIdSort);
        support.retrieveLocusId().then(function (_locusId) {
          locusId = _locusId;
          done();
        });
      });

      xit('should search for logs by valid uuid', function () {
        support.searchAndVerifyResult(support.searchValidUuid, support.searchValidEmail);

        utils.expectIsDisplayed(support.supportTable);
        utils.expectIsDisplayed(support.emailAddress);
        utils.expectText(support.rowContents, support.searchValidEmail);
      });

      xit('should search for logs by valid locusId', function () {
        support.searchAndVerifyResult(locusId, support.searchValidEmail);
        utils.expectIsDisplayed(support.supportTable);

        utils.expectIsDisplayed(support.locusId);
        utils.expectText(support.locusId, locusId);
        utils.expectNotText(support.callStart, '-NA-');
      });

      xit('should display call-info panel for the log', function () {
        utils.click(support.callInfoIcon);
        utils.expectIsDisplayed(support.closeCallInfo);
      });

      xit('should display log-list panel on search', function () {
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
    }

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
      utils.expectCount(navigation.tabCount, 3);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('partner admin logs', function () {
    it('should login as partner admin', function () {
      // https://int-admin.ciscospark.com/?code=MzExNTEwZjQtM2NkYi00YTc4LTk0N2ItODRjYzc5Y2NkMTcyZTJjZTcwMjItN2Fm&state=random-string#/login/c054027f-c5bd-4598-8cd8-07c08163e8cd/Atlas%20Test%20Partner%20Organization/true
      login.login('partner-admin', '#/login/c054027f-c5bd-4598-8cd8-07c08163e8cd/Atlas%20Test%20Partner%20Organization/true');
    });

    it('should display supoort tab for user based on role', function () {
      utils.expectIsDisplayed(navigation.supportTab);
    });

    it('should display error for empty input', function () {
      utils.click(navigation.supportTab);
      utils.click(navigation.logsPage);
      utils.click(support.logSearchBtn);
      notifications.assertError('Search input cannot be empty.');
    });

    it('should search for logs by valid email address', function () {
      utils.click(navigation.supportTab);
      utils.click(navigation.logsPage);
      utils.clear(support.logSearchField);
      utils.sendKeys(support.logSearchField, 'atlaspartneradmin@atlas.test.com');
      utils.click(support.logSearchBtn);
      utils.expectIsDisplayed(support.supportTable);
    });

    it('should search for logs by valid uuid', function () {
      utils.click(navigation.supportTab);
      utils.click(navigation.logsPage);
      utils.clear(support.logSearchField);
      utils.sendKeys(support.logSearchField, support.searchValidUuid);
      utils.click(support.logSearchBtn);
      utils.expectIsDisplayed(support.supportTable);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });



  xdescribe('Billing page', function () {
    //TODO this is environment specific order and needs to be fixed
    if (isProductionBackend) {
      return;
    }
    it('should login as mock cisco support user', function () {
      login.login('mockcisco-support-user', '#/orderprovisioning?enc=' + encodeURIComponent(
        'VQTn2BCzyCmtO+cdZBNNXwtGx06uY4ce53gGZ%2FSwBJmD81xl9zWCln6pBM0pSv6N'));
    });

    it('should display correct tabs for user based on role', function () {
      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.supportTab);
      utils.expectCount(navigation.tabCount, 3);
    });

    it('should display billing tab when support tab is clicked', function () {
      utils.click(navigation.supportTab);
      utils.expectIsDisplayed(navigation.logsTab);
      utils.expectIsDisplayed(navigation.billingTab);
    });

    it('should be able to resend customer/partner email from the dropdown', function () {
      utils.click(support.orderListAction);
      utils.expectIsDisplayed(support.resendCustomerEmail);
      utils.expectIsDisplayed(support.resendPartnerEmail);
      utils.click(support.resendCustomerEmail);
      notifications.assertSuccess('Email to Customer sent successfully');
    });
  });
});
