'use strict';

describe('Site List Service', function () {

  //Load the required dependent modules
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  //Declare the variables
  var $q, $rootScope, SiteListService, WebExApiGatewayService, WebExUtilsFact, fake_authInfo, fake_gridData, fake_allSitesLicenseInfo, fake_gridDataWithFinalLicenseInfo;
  var deferred_licenseInfo;

  //Inject the required dependent services/factories/data/etc
  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _SiteListService_,
    _WebExApiGatewayService_,
    _WebExUtilsFact_
  ) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    SiteListService = _SiteListService_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExUtilsFact = _WebExUtilsFact_;

    deferred_licenseInfo = $q.defer();

    //Define the mock data
    fake_authInfo = {
      'getConferenceServicesWithoutSiteUrl': function () {
        return [{
          "label": "Meeting Center 200",
          "value": 1,
          "name": "confRadio",
          "license": {
            "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
            "offerName": "MC",
            "licenseType": "CONFERENCING",
            "billingServiceId": "SubCt30test201582703",
            "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
            "volume": 25,
            "isTrial": false,
            "status": "ACTIVE",
            "capacity": 200,
            "siteUrl": "sjsite14.webex.com"
          },
          "isCustomerPartner": false
        }, {
          "label": "Meeting Center 25",
          "value": 1,
          "name": "confRadio",
          "license": {
            "licenseId": "MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com",
            "offerName": "MC",
            "licenseType": "CONFERENCING",
            "billingServiceId": "SubCt30test201592302",
            "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
            "volume": 25,
            "isTrial": false,
            "status": "PENDING",
            "capacity": 25,
            "siteUrl": "sjsite04.webex.com"
          },
          "isCustomerPartner": false
        }, {
          "label": "Meeting Center 200",
          "value": 1,
          "name": "confRadio",
          "license": {
            "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com",
            "offerName": "MC",
            "licenseType": "CONFERENCING",
            "billingServiceId": "SubCt30test1443208805",
            "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
            "volume": 25,
            "isTrial": false,
            "status": "PENDING",
            "capacity": 200,
            "siteUrl": "t30citestprov9.webex.com"
          },
          "isCustomerPartner": false
        }];
      },

      'getPrimaryEmail': function () {
        return "some@email.com";
      }
    };

    fake_gridData = [{
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201582703",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "sjsite14.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 25",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201592302",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 25,
        "siteUrl": "sjsite04.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test1443208805",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "t30citestprov9.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8da91fa1_200_cisjsite031.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test1443208885",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite031.webex.com"
      },
      "isCustomerPartner": false
    }];

    fake_allSitesLicenseInfo = [{
      "webexSite": "sjsite14.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "t30citestprov9.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite14.webex.com",
      "siteHasCMRLicense": true,
      "offerCode": "CMR",
      "capacity": "100"
    }, {
      "webexSite": "cisjsite031.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "25"
    }];

    fake_gridDataWithFinalLicenseInfo = [{
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_200_cisjsite031.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "1446768353",
        "features": ["cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "cisjsite031.webex.com"
      },
      "isCustomerPartner": false,
      "showCSVInfo": false,
      "showSiteLinks": false,
      "isIframeSupported": false,
      "isAdminReportEnabled": false,
      "isError": false,
      "isWarn": false,
      "webExSessionTicket": null,
      "adminEmailParam": null,
      "advancedSettings": null,
      "userEmailParam": null,
      "webexAdvancedUrl": null,
      "MCLicensed": true,
      "licenseTooltipDisplay": "\nMeeting Center 200",
      "licenseTypeContentDisplay": "Meeting Center 200",
      "ECLicensed": false,
      "SCLicensed": false,
      "TCLicensed": false,
      "CMRLicensed": false,
      "multipleWebexServicesLicensed": false
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_66e1a7c9-3549-442f-942f-41a53b020689_200_sjsite04.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201592301",
        "features": ["cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "sjsite04.webex.com"
      },
      "isCustomerPartner": false,
      "showCSVInfo": false,
      "showSiteLinks": false,
      "isIframeSupported": false,
      "isAdminReportEnabled": false,
      "isError": false,
      "isWarn": false,
      "webExSessionTicket": null,
      "adminEmailParam": null,
      "advancedSettings": null,
      "userEmailParam": null,
      "webexAdvancedUrl": null,
      "MCLicensed": true,
      "licenseTooltipDisplay": "\nMeeting Center 200\nMeeting Center 25",
      "licenseTypeContentDisplay": "Multiple...",
      "ECLicensed": false,
      "SCLicensed": false,
      "TCLicensed": false,
      "CMRLicensed": false,
      "multipleWebexServicesLicensed": true //NOTE: This record has bad data. In reality, such licensing would not happen.
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201582703",
        "features": ["cloudmeetings"],
        "volume": 3,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "sjsite14.webex.com"
      },
      "isCustomerPartner": false,
      "showCSVInfo": false,
      "showSiteLinks": false,
      "isIframeSupported": false,
      "isAdminReportEnabled": false,
      "isError": false,
      "isWarn": false,
      "webExSessionTicket": null,
      "adminEmailParam": null,
      "advancedSettings": null,
      "userEmailParam": null,
      "webexAdvancedUrl": null,
      "MCLicensed": true,
      "licenseTooltipDisplay": "\nMeeting Center 200\nCollaboration Meeting Rooms",
      "licenseTypeContentDisplay": "Multiple...",
      "ECLicensed": false,
      "SCLicensed": false,
      "TCLicensed": false,
      "CMRLicensed": true,
      "multipleWebexServicesLicensed": true
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test1443208805",
        "features": ["cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "t30citestprov9.webex.com"
      },
      "isCustomerPartner": false,
      "showCSVInfo": false,
      "showSiteLinks": false,
      "isIframeSupported": false,
      "isAdminReportEnabled": false,
      "isError": false,
      "isWarn": false,
      "webExSessionTicket": null,
      "adminEmailParam": null,
      "advancedSettings": null,
      "userEmailParam": null,
      "webexAdvancedUrl": null,
      "MCLicensed": true,
      "licenseTooltipDisplay": "\nMeeting Center 200",
      "licenseTypeContentDisplay": "Meeting Center 200",
      "ECLicensed": false,
      "SCLicensed": false,
      "TCLicensed": false,
      "CMRLicensed": false,
      "multipleWebexServicesLicensed": false
    }];

    //Create spies
    spyOn(WebExUtilsFact, "getAllSitesWebexLicenseInfo").and.returnValue(deferred_licenseInfo.promise);
    spyOn(SiteListService, "updateLicenseTypesColumn");

  }));

  //1. Test suite to check things exist
  describe(': Check things exist', function () {
    it(': should exist as a service', function () {
      expect(SiteListService).toBeDefined();
    });

    it(': fake_allSitesLicenseInfo should exist', function () {
      expect(fake_allSitesLicenseInfo).not.toBe(null);
    });

  });

  //2. Test suite for license tests
  xdescribe(': Using then and done', function () {
    //2. Test spec
    it('xxx', function (done) {
      deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

      SiteListService.updateLicenseTypesColumn(fake_gridData).then(function (finalGridData) {

        alert("2. fake_gridData = " + JSON.stringify(fake_gridData));
        alert("2. finalGridData = " + JSON.stringify(finalGridData));

        expect(finalGridData[0]).not.toBe(null);
        done();
      });

    });
  });

  //2. Test spec for license types column
  describe(': Check license types column', function () {

    it(': site has only single licensed WebEx service', function () {

      //deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);
      //$rootScope.$apply();

      //var response = SiteListService.getAllSitesLicenseData(fake_gridData); //.then(function (response) {
      //expect(response).not.toBe(null);

      alert("3. BEFORE fake_gridData = " + JSON.stringify(fake_gridData));
      SiteListService.updateLicenseTypesColumn(fake_gridData);
      deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);
      $rootScope.$apply();
      alert("3. AFTER fake_gridData = " + JSON.stringify(fake_gridData));

      expect(SiteListService.updateLicenseTypesColumn).toHaveBeenCalled();

      //expect(SiteListService.getAllSitesLicenseData).toHaveBeenCalled(); //With(fake_gridData);
      //expect(finalGridData[0]).not.toBe(null);
    });
  });

});
