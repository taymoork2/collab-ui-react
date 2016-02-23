'use strict';

describe('WebEx site list', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitelist.t31CSVToggleUser.testAdminUsername, sitelist.t31CSVToggleUser.testAdminPassword);
  });

  it('should navigate to webex site list', function () {
    navigation.clickServicesTab();
    utils.click(sitelist.conferencingLink);
  });

  it('should detect the CSV column', function () {
    utils.wait(sitelist.csvColumnId);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
