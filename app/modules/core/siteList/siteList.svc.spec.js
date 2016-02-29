'use strict';

describe('Site List Service', function () {

  //Load the required dependent modules
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  //Declare the variables
  var $rootScope, SiteListService, WebExUtilsFact, fake_authInfo, fake_gridData, fake_allSitesLicenseInfo, fake_gridDataWithFinalLicenseInfo;

  //Inject the required dependent services/factories/data/etc
  beforeEach(inject(function (
    _$rootScope_,
    _SiteListService_,
    _WebExUtilsFact_
  ) {
    $rootScope = _$rootScope_;
    SiteListService = _SiteListService_;
    WebExUtilsFact = _WebExUtilsFact_;

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
    }];

    fake_allSitesLicenseInfo = [{
      "webexSite": "sjsite14.webex.com",
      "siteHasMCLicense": true,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": false
    }, {
      "webexSite": "t30citestprov9.webex.com",
      "siteHasMCLicense": true,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": false
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": false
    }, {
      "webexSite": "sjsite14.webex.com",
      "siteHasMCLicense": false,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": true
    }, {
      "webexSite": "cisjsite031.webex.com",
      "siteHasMCLicense": true,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": false
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "siteHasECLicense": false,
      "siteHasSCLicense": false,
      "siteHasTCLicense": false,
      "siteHasCMRLicense": false
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
    spyOn(_WebExUtilsFact_, "getAllSitesWebexLicenseInfo").and.returnValue(fake_allSitesLicenseInfo);

  }));

  //1. Test suite to check things exist
  describe(': Check things exists', function () {
    it(': should exist as a service', function () {
      expect(SiteListService).toBeDefined();
    });

    it(': fake_allSitesLicenseInfo should exist', function () {
      expect(fake_allSitesLicenseInfo).not.toBe(null);
    });

  });

});
