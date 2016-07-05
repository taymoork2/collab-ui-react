'use strict';

/* global webExSiteList */
/* global webEx */
/* global webExCommon */

// Start of site list tests
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

  it('should not detect WebEx CSV operation icon', function () {
    if (setup) {
      expect(webExCommon.t30csvCogDisabled.isPresent()).toBeFalsy();
      expect(webExCommon.t30csvCogEnabled.isPresent()).toBeFalsy();
      expect(webExCommon.t30csvSpinner.isPresent()).toBeFalsy();
      expect(webExCommon.t30csvResult.isPresent()).toBeFalsy();
      expect(webExCommon.t30csvIcon.isPresent()).toBeFalsy();
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

  it('should detect WebEx CSV operation icon', function () {
    if (setup) {
      var csvCogDisabled = webExCommon.t31csvCogDisabled.isPresent();
      var csvCogEnabled = webExCommon.t31csvCogEnabled.isPresent();
      expect(webExCommon.t31csvIcon.isPresent()).toBeTruthy();
      expect(csvCogDisabled || csvCogEnabled).toBe(true);
    }
  });

  it('should log out', function () {
    navigation.logout();
  });
});

/**
 * ********************* IMPORTANT *********************
 * The following account is a Dev DMZ User - To be deleted once BTS is ready.
 * Keep these tests disabled
 * ********************* IMPORTANT *********************
 */
//Start dev dmz tests
xdescribe('WebEx Sitelist: ' + webExCommon.devDmzInfo.siteUrl + ": ", function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-siteCsvTestAdmin',
      webExCommon.devDmzInfo.testAdminUsername,
      webExCommon.devDmzInfo.testAdminPassword,
      webExCommon.devDmzInfo.siteUrl
    );

    promise.then(
      function success(ticket) {
        setup = (null !== ticket);
        //If this doesn't happen, then login is not successful.
      },

      function error() {
        setup = false;
      }
    );
  }); // beforeAll()

  xit('should detect checking services spinner and then WebEx CSV operation icon', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);

      //WebEx CSV tests, currently pointing to dev dmz
      utils.wait(webExCommon.devDmzInfo.checkingServicesSpinner);
      utils.wait(webExCommon.devDmzInfo.csvCogEnabled);
      expect(webExCommon.devDmzInfo.checkingServicesSpinner.isPresent()).toBeFalsy();
    }
  });

  xit('should log out', function () {
    navigation.logout();
  });
}); //End dev dmz tests

// End of site list tests
