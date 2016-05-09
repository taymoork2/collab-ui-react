'use strict';

/*global webEx, sitelist*/

describe('Services > Webex page aka Site List page', function () {

  describe(': CSV Export/Import : ', function () {

    beforeAll(function () {
      login.login('t31CSVToggleUser');
    });

    it('should login as ' + sitelist.t31CSVToggleUser.testAdminUsername + ' and navigate to site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
      utils.wait(sitelist.siteListPageId);
    });

    it('should detect the CSV column', function () {
      utils.wait(sitelist.csvColumnId);
    });
    /*
        xit('should detect CSV Export & Import status is given', function () {
          utils.wait(sitelist.csvImportId);
          utils.wait(sitelist.csvExportId);
        });
    */
    afterAll(function () {
      navigation.logout();
    });
  });

  //Start tests to detect 'Not Available' and warning icon conditions
  describe("test CSV 'Not Anavailable' condition : ", function () {

    beforeAll(function () {
      login.login('t30csvNotAvailableUser');
    });

    it('should login as ' + sitelist.t30csvNotAvailableUser.testAdminUsername + ' and navigate to site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
    });

    it("should detect 'Not Available' for T30 site", function () {
      utils.wait(sitelist.t30csvNotAvail);
    });

    afterAll(function () {
      navigation.logout();
    });
  });

  describe("test CSV warning icon condition: ", function () {

    beforeAll(function () {
      login.login('t30csvWbxNotEntitledUser');
    });

    it('should login as ' + sitelist.t30csvWbxNotEntitledUser.testAdminUsername + ' and navigate to site list page', function () {
      navigation.clickServicesTab();
      utils.click(sitelist.conferencingLink);
    });

    it('should detect warning icon due to entitlement authentication failure', function () {
      utils.wait(sitelist.siteEntitlementAuthFailure);
    });

    afterAll(function () {
      navigation.logout();
    });
  });
  /*
      //Start multi center license tests
      xdescribe(': License Types - Single : ', function () {

        it('should allow login as admin user ' + sitelist.multiCenterLicenseUser_single.testAdminUsername, function () {
          //TODO:  If and when we want to enable this test, need to create this user login credential in the test_helper.js
          login.login('multiCenterLicenseUser_single');
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
          //TODO:  If and when we want to enable this test, need to create this user login credential in the test_helper.js
          login.login('multiCenterLicenseUser_multiple');
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
  */

});
