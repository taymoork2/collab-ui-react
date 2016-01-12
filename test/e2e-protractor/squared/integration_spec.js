'use strict';

describe('App flow', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should just login', function () {
    login.login('pbr-admin');
  });

  describe('Switching tabs', function () {
    it('clicking on system health panel should open to status page in a new tab', function () {
      navigation.clickHome();

      utils.expectIsDisplayed(landing.convertButton);

    });

    it('clicking on orgs tab should change the view', function () {
      navigation.clickOrganization();

      utils.expectIsDisplayed(manage.orgTitle);
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
  });
});
