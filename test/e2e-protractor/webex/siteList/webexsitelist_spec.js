'use strict';

/* global webExSiteList */
/* global webEx */
/* global webExCommon */

// Start of site list tests
describe('WebEx Sitelist: ' + webExCommon.BTS2.siteUrl + ": ", function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-t30BTSTestAdmin-SingleLicense',
      webExCommon.BTS2.testAdminUsername,
      webExCommon.BTS2.testAdminPassword,
      webExCommon.BTS2.siteUrl
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

  afterAll(function () {
    navigation.logout();
  }); //afterAll

  it('should allow login as ' + webExCommon.BTS2.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect single licensed site', function () {
    if (setup) {
      utils.wait(webExCommon.BTS2.licenseID);
    }
  });

  it('should detect ' + webExCommon.BTS2.siteUrl + ' is a CI site', function () {
    if (setup) {
      utils.wait(webExCommon.BTS2.isCIID);
    }
  });

  it('should not detect WebEx CSV operation icon', function () {
    if (setup) {
      expect(webExCommon.BTS2.csvCogDisabled.isPresent()).toBeFalsy();
      expect(webExCommon.BTS2.csvCogEnabled.isPresent()).toBeFalsy();
      expect(webExCommon.BTS2.csvSpinner.isPresent()).toBeFalsy();
      expect(webExCommon.BTS2.csvResult.isPresent()).toBeFalsy();
      expect(webExCommon.BTS2.csvIcon.isPresent()).toBeFalsy();
    }
  });

});

describe('WebEx Sitelist: ' + webExCommon.BTS1.siteUrl + ": ", function () {
  var setup = false;

  beforeAll(function () {
    var promise = webEx.setup(
      1,
      'wbx-t30BTSTestAdmin-MultiLicense',
      webExCommon.BTS1.testAdminUsername,
      webExCommon.BTS1.testAdminPassword,
      webExCommon.BTS1.siteUrl
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

  afterAll(function () {
    navigation.logout();
  }); //afterAll

  it('should allow login as ' + webExCommon.BTS1.testAdminUsername + ' and navigate to webex site list page', function () {
    if (setup) {
      navigation.clickServicesTab();
      utils.click(webExSiteList.conferencingLink);
      utils.wait(webExSiteList.siteListPageId);
    }
  });

  it('should detect multiple licensed site', function () {
    if (setup) {
      utils.wait(webExCommon.BTS1.licenseID);
    }
  });

  it('should detect ' + webExCommon.BTS1.siteUrl + ' is a CI site', function () {
    if (setup) {
      utils.wait(webExCommon.BTS1.isCIID);
    }
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

  afterAll(function () {
    navigation.logout();
  }); //afterAll

  it('should detect checking services spinner and then WebEx CSV operation icon', function () {
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

  it('should check import/export modal', function () {
    if (setup) {
      //Click on the csv icon
      utils.click(webExCommon.devDmzInfo.csvCogEnabled);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalHeader);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalBody);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalCloseButton);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalExportCard);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalExportIcon);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalImportCard);
      utils.expectIsDisplayed(webExCommon.devDmzInfo.csvModalImportIcon);
    }
  });

}); //End dev dmz tests

// End of site list tests
