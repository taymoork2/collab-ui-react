'use strict';

/* global describe */
/* global it */
/* global browser */
/* global expect */

describe('App flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors(this.getFullName());
  });

  it('should just login', function () {
    login.login('pbr-admin');
  });

  describe('Switching tabs', function () {
    it('clicking on system health panel should open to status page in a new tab', function () {
      navigation.clickHome();
      var appWindow = browser.getWindowHandle();
      utils.click(landing.monitoringRows.first());
      browser.getAllWindowHandles().then(function (handles) {
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        navigation.expectDriverCurrentUrl('status.projectsquared.com/');
        browser.driver.close();
        browser.switchTo().window(appWindow);
      });
    });

    it('clicking on orgs tab should change the view', function () {
      navigation.clickOrganization();

      utils.expectIsDisplayed(manage.displayName);
      utils.expectIsDisplayed(manage.estimatedSize);
      utils.expectIsDisplayed(manage.totalUsers);
      utils.expectIsDisplayed(manage.enableSSO);
      utils.expectIsNotDisplayed(manage.saveButton);
      utils.expectIsDisplayed(manage.refreshButton);
    });

    it('clicking on reports tab should change the view', function () {
      navigation.clickReports();

      utils.expectIsDisplayed(reports.onboarding);
      utils.expectIsDisplayed(reports.calls);
      utils.expectIsDisplayed(reports.conversations);
      utils.expectIsDisplayed(reports.activeUsers);
      utils.expectIsDisplayed(reports.convOneOnOne);
      utils.expectIsDisplayed(reports.convGroup);
      utils.expectIsDisplayed(reports.callsAvgDuration);
      utils.expectIsDisplayed(reports.contentShared);
      utils.expectIsDisplayed(reports.contentShareSizes);
    });

    it('should load cached values into directive when switching tabs', function () {
      navigation.clickHome();

      utils.expectIsDisplayed(landing.reloadedTime);
      utils.expectIsDisplayed(landing.refreshData);
      utils.expectIsDisplayed(landing.callsChart);
    });
  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });

});
