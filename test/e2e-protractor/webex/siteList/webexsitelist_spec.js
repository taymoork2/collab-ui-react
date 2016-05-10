'use strict';

/*global webEx, sitelist*/

describe('Services > Webex page aka Site List page', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = false;
  });

  afterEach(function () {
    browser.ignoreSynchronization = true;
  });

  describe(': CSV Export/Import : ', function () {
    var setup = false;

    beforeAll(function () {
      var promise = webEx.setup(sitelist.t31CSVToggleUser.testAdminUsername, sitelist.t31CSVToggleUser.testAdminPassword, sitelist.t31CSVToggleUser.siteUrl);
      promise.then(function (ticket) {
        if (ticket) {
          setup = true;
        }
      });
    });

    it('should navigate to webex site list', function () {
      if (setup) {
        navigation.clickServicesTab();
        utils.click(sitelist.conferencingLink);
        utils.wait(sitelist.siteListPageId);
      }
    });

    it('should detect the CSV column', function () {
      if (setup) {
        utils.wait(sitelist.csvColumnId);
      }
    });

    xit('should detect CSV Export & Import status is given', function () {
      if (setup) {
        utils.wait(sitelist.csvImportId);
        utils.wait(sitelist.csvExportId);
      }
    });

    afterAll(function () {
      navigation.logout();
    });
  });

  //Start tests to detect 'Not Available' and warning icon conditions
  describe("test CSV 'Not Anavailable' condition : ", function () {
    var setup = false;

    beforeAll(function () {
      var promise = webEx.setup(sitelist.t30csvNotAvailableUser.testAdminUsername, sitelist.t30csvNotAvailableUser.testAdminPassword, sitelist.t30csvNotAvailableUser.siteUrl);
      promise.then(function (ticket) {
        if (ticket) {
          setup = true;
        }
      });
    });

    it('should login as admin user ' + sitelist.t30csvNotAvailableUser.testAdminUsername + ', and navigate to site list page', function () {
      if (setup) {
        navigation.clickServicesTab();
        utils.click(sitelist.conferencingLink);
      }
    });

    it("should detect 'Not Available' for T30 site", function () {
      if (setup) {
        utils.wait(sitelist.t30csvNotAvail);
      }
    });

    afterAll(function () {
      navigation.logout();
    });
  });

  describe("test CSV warning icon condition: ", function () {
    var setup = false;

    beforeAll(function () {
      var promise = webEx.setup(sitelist.t30csvWbxNotEntitledUser.testAdminUsername, sitelist.t30csvWbxNotEntitledUser.testAdminPassword, sitelist.t30csvNotAvailableUser.siteUrl);
      promise.then(function (ticket) {
        if (ticket) {
          setup = true;
        }
      });
    });

    it('should login as admin user ' + sitelist.t30csvWbxNotEntitledUser.testAdminUsername + ', and navigate to site list page', function () {
      if (setup) {
        navigation.clickServicesTab();
        utils.click(sitelist.conferencingLink);
      }
    });

    it('should detect warning icon due to entitlement authentication failure', function () {
      if (setup) {
        utils.wait(sitelist.siteEntitlementAuthFailure);
      }
    });

    afterAll(function () {
      navigation.logout();
    });
  });

  //Start multi center license tests
  xdescribe(': License Types - Single : ', function () {

    it('should allow login as admin user ' + sitelist.multiCenterLicenseUser_single.testAdminUsername, function () {
      login.loginThroughGuiUsingIntegrationBackend(sitelist.multiCenterLicenseUser_single.testAdminUsername, sitelist.multiCenterLicenseUser_single.testAdminPassword);
    });

    it('should navigate to webex site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the license types column', function () {
      utils.wait(sitelist.licenseTypesColumnId);
    });

    it('should detect text MC 100', function () {
      var mc100 = "Meeting Center 100";
      utils.expectText(sitelist.singleLicenseSiteId, mc100);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  xdescribe(': License Types - Multiple : ', function () {

    it('should allow login as admin user ' + sitelist.multiCenterLicenseUser_multiple.testAdminUsername, function () {
      login.loginThroughGuiUsingIntegrationBackend(sitelist.multiCenterLicenseUser_multiple.testAdminUsername, sitelist.multiCenterLicenseUser_multiple.testAdminPassword);
    });

    it('should navigate to webex site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the license types column', function () {
      utils.wait(sitelist.licenseTypesColumnId);
    });

    it('should detect text multiple', function () {
      var multiple = "Multiple...";
      utils.expectText(sitelist.multiLicenseSiteId, multiple);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
