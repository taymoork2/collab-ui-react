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
  });
});
