'use strict';

/* global webExSiteList */
/* global webEx */
/* global webExCommon */

// Start of Licenses column tests
xdescribe('WebEx Sitelist: License - Single: ', function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-singleCenterLicenseTestAdmin',
      webExCommon.singleCenterLicenseInfo.testAdminUsername,
      webExCommon.singleCenterLicenseInfo.testAdminPassword,
      webExCommon.singleCenterLicenseInfo.siteUrl
    );

    promise.then(
      function success(ticket) {
        setup = (null !== ticket);
      },

      function error() {
        setup = false;
      }
    );
  }); // beforeAll()

  it('should allow login as admin user ' + webExCommon.singleCenterLicenseInfo.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect the license column', function () {
    if (setup) {
      utils.wait(webExSiteList.licenseTypesColumnId);
    }
  });

  it('should detect text ' + webExSiteList.license_MC200, function () {
    if (setup) {
      utils.expectText(webExCommon.singleLicenseSiteId, webExSiteList.license_MC200);
    }
  });

  it('should log out', function () {
    navigation.logout();
  });
});

xdescribe('WebEx Sitelist: License - Multiple: ', function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-multipleCenterLicenseTestAdmin',
      webExCommon.multiCenterLicenseInfo.testAdminUsername,
      webExCommon.multiCenterLicenseInfo.testAdminPassword,
      webExCommon.multiCenterLicenseInfo.siteUrl
    );

    promise.then(
      function success(ticket) {
        setup = (null !== ticket);
      },

      function error() {
        setup = false;
      }
    );
  }); // beforeAll()

  it('should allow login as admin user ' + webExCommon.multiCenterLicenseInfo.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect the license column', function () {
    if (setup) {
      utils.wait(webExSiteList.licenseTypesColumnId);
    }
  });

  it('should detect text ' + webExSiteList.license_Multiple, function () {
    if (setup) {
      utils.expectText(webExCommon.multiLicenseSiteId, webExSiteList.license_Multiple);
    }
  });

  it('should log out', function () {
    navigation.logout();
  });
});
// End of Licenses column tests
