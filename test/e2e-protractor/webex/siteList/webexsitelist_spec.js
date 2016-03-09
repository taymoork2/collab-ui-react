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

  it('should detect the Import label', function () {
    utils.wait(sitelist.csvImportId);
  });

  it('should detect the Export label', function () {
    utils.wait(sitelist.csvExportId);
  });

  //check T30 site where CSV = Not Available.   Enable later after setup new profile with CSV enabled by feature toggle
  xit('T30 site should display Not Available', function () {
    utils.wait(sitelist.t30csvNotAvail);
  });

  //check T31 site where CSV = Not Availabl.  Enable later after setup new profile with CSV enabled by feature toggle
  xit('T31 site but user not yet configured to be admin of this site should display Not Available', function () {
    utils.wait(sitelist.t31csvNotAvail);
  });

  xit('should log out', function () {
    navigation.logout();
  });
});
