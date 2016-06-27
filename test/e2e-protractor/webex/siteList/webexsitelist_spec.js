'use strict';

/* global webExSiteList */
/* global webEx */
/* global webExCommon */

// Start of Licenses column tests
describe('WebEx Sitelist: ' + webExCommon.t30citestprov9Info.siteUrl + ": ", function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-singleCenterLicenseTestAdmin',
      webExCommon.t30citestprov9Info.testAdminUsername,
      webExCommon.t30citestprov9Info.testAdminPassword,
      webExCommon.t30citestprov9Info.siteUrl
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

  it('should allow login as ' + webExCommon.t30citestprov9Info.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect single licensed site', function () {
    if (setup) {
      utils.wait(webExCommon.t30citestprov9Info.licenseID);
    }
  });

  it('should detect ' + webExCommon.t30citestprov9Info.siteUrl + ' is a CI site', function () {
    if (setup) {
      utils.wait(webExCommon.t30citestprov9Info.isCIID);
    }
  });

  it('should log out', function () {
    navigation.logout();
  });
});

describe('WebEx Sitelist: ' + webExCommon.t30citestprov6Info.siteUrl + ": ", function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-multipleCenterLicenseTestAdmin',
      webExCommon.t30citestprov6Info.testAdminUsername,
      webExCommon.t30citestprov6Info.testAdminPassword,
      webExCommon.t30citestprov6Info.siteUrl
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

  it('should allow login as ' + webExCommon.t30citestprov6Info.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect multiple licensed site', function () {
    if (setup) {
      utils.wait(webExCommon.t30citestprov6Info.licenseID);
    }
  });

  it('should detect ' + webExCommon.t30citestprov6Info.siteUrl + ' is a CI site', function () {
    if (setup) {
      utils.wait(webExCommon.t30citestprov6Info.isCIID);
    }
  });

  it('should log out', function () {
    navigation.logout();
  });
});
// End of Licenses column tests
