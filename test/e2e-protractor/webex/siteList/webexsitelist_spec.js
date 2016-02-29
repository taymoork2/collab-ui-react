'use strict';

describe('WebEx site list', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should allow login as admin user ' + sitelist.t31CSVToggleUser.testAdminUsername, function () {
    login.loginThroughGui(sitelist.t31CSVToggleUser.testAdminUsername, sitelist.t31CSVToggleUser.testAdminPassword);
  });

  it('should navigate to webex site list', function () {
    navigation.clickServicesTab();
    utils.click(sitelist.conferencingLink);
    utils.wait(sitelist.siteListPageId);
  });

  it('should detect the CSV column', function () {
    utils.wait(sitelist.csvColumnId);
  });

  xit('should log out', function () {
    navigation.logout();
  });
});
