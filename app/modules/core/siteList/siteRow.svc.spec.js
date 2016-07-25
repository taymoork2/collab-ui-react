'use strict';

describe('Service: WebExSiteRowService', function () {

  var controller, $rootScope, $scope, $q, WebExSiteRowService, Auth, Authinfo, FeatureToggleService, WebExUtilsFact, WebExApiGatewayService, WebExApiGatewayConstsService, deferred_licenseInfo, deferredIsSiteSupportsIframe, deferredCsvStatus;

  var fakeSiteRow1 = {
    "label": "Meeting Center 200",
    "value": 1,
    "name": "confRadio",
    "license": {
      "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_cisjsite031.webex.com",
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
    "showCSVInfo": true,
    "csvStatusObj": null,
    "csvPollIntervalObj": null,
    "isIframeSupported": false,
    "isAdminReportEnabled": false,
    "showSiteLinks": true,
    "isError": false,
    "isWarn": false,
    "isCSVSupported": false,
    "adminEmailParam": "sjsite14-lhsieh@mailinator.com",
    "userEmailParam": "sjsite14-lhsieh@mailinator.com",
    "advancedSettings": "https://cisjsite031.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage",
    "webexAdvancedUrl": "https://cisjsite031.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage",
    "siteUrl": "cisjsite031.webex.com",
    "showLicenseTypes": true,
    "multipleWebexServicesLicensed": false,
    "licenseTypeContentDisplay": "Meeting Center 200",
    "licenseTooltipDisplay": null,
    "MCLicensed": true,
    "ECLicensed": false,
    "SCLicensed": false,
    "TCLicensed": false,
    "EELicensed": false,
    "CMRLicensed": false,
    "csvMock": {
      "mockStatus": false,
      "mockStatusStartIndex": 0,
      "mockStatusEndIndex": 0,
      "mockStatusCurrentIndex": null,
      "mockExport": false,
      "mockImport": false,
      "mockFileDownload": false
    },
    "$$hashKey": "uiGrid-0007",
    "showCSVIconAndResults": true
  };
  var fakeSiteRow2 = {
    "label": "Meeting Center 200",
    "value": 1,
    "name": "confRadio",
    "license": {
      "licenseId": "MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com",
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
    "showCSVInfo": true,
    "csvStatusObj": {
      "siteUrl": "sjsite04.webex.com",
      "isMockResult": false,
      "status": "importCompletedWithErr",
      "details": {
        "jobType": 1,
        "request": 2,
        "errorLogLink": "NDc2NyUlZXJyb3Jsb2c=",
        "created": 1465596732000,
        "started": 1465596877000,
        "finished": 1465597477000,
        "totalRecords": 20,
        "successRecords": 0,
        "failedRecords": 20,
        "importFileName": "NewSiteUsersU16LE.csv"
      }
    },
    "csvPollIntervalObj": {
      "$$state": {
        "status": 2,
        "value": "canceled"
      },
      "$$intervalId": 90
    },
    "isIframeSupported": true,
    "isAdminReportEnabled": true,
    "showSiteLinks": true,
    "isError": false,
    "isWarn": false,
    "isCSVSupported": true,
    "adminEmailParam": "sjsite14-lhsieh@mailinator.com",
    "userEmailParam": "sjsite14-lhsieh@mailinator.com",
    "advancedSettings": "https://sjsite04.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage",
    "webexAdvancedUrl": "https://sjsite04.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage",
    "siteUrl": "sjsite04.webex.com",
    "showLicenseTypes": true,
    "multipleWebexServicesLicensed": true,
    "licenseTypeContentDisplay": "Multiple...",
    "licenseTooltipDisplay": "Meeting Center 200<br>Meeting Center 25",
    "MCLicensed": true,
    "ECLicensed": false,
    "SCLicensed": false,
    "TCLicensed": false,
    "EELicensed": false,
    "CMRLicensed": false,
    "csvMock": {
      "mockStatus": false,
      "mockStatusStartIndex": 0,
      "mockStatusEndIndex": 0,
      "mockStatusCurrentIndex": null,
      "mockExport": false,
      "mockImport": false,
      "mockFileDownload": false
    },
    "$$hashKey": "uiGrid-0009",
    "showCSVIconAndResults": true,
    "asyncErr": false
  };

  var fakeConferenceService1 = {
    "label": "Meeting Center 200",
    "value": 1,
    "name": "confRadio",
    "license": {
      "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_cisjsite031.webex.com",
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
    "isCustomerPartner": false
  };
  var fakeConferenceService2 = {
    "label": "Meeting Center 200",
    "value": 1,
    "name": "confRadio",
    "license": {
      "licenseId": "MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com",
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
    "isCustomerPartner": false
  };
  //var fakeConferenceServicesArray = [fakeConferenceService1, fakeConferenceService2];
  var fakeConferenceServicesArray = [fakeConferenceService2];

  var fake_allSitesLicenseInfo = [{
    "webexSite": "sjsite04.webex.com",
    "siteHasMCLicense": true,
    "offerCode": "MC",
    "capacity": "200"
  }, {
    "webexSite": "cisjsite031.webex.com",
    "siteHasMCLicense": true,
    "offerCode": "MC",
    "capacity": "200"
  }, {
    "webexSite": "sjsite04.webex.com",
    "siteHasMCLicense": true,
    "offerCode": "CMR",
    "capacity": "100"
  }];

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(function (_$rootScope_, _$q_, _Auth_, _Authinfo_, _FeatureToggleService_, _WebExUtilsFact_, _WebExApiGatewayService_, _WebExApiGatewayConstsService_, _WebExSiteRowService_) {

    Auth = _Auth_;
    Authinfo = _Authinfo_;
    WebExSiteRowService = _WebExSiteRowService_;
    FeatureToggleService = _FeatureToggleService_;
    WebExUtilsFact = _WebExUtilsFact_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    $rootScope = _$rootScope_;
    $q = _$q_;

    deferred_licenseInfo = $q.defer();
    deferredIsSiteSupportsIframe = $q.defer();
    deferredCsvStatus = $q.defer();

    WebExApiGatewayConstsService.csvStates = {
      authTokenError: 'authTokenError',
      none: 'none',
      exportInProgress: 'exportInProgress',
      exportCompletedNoErr: 'exportCompletedNoErr',
      exportCompletedWithErr: 'exportCompletedWithErr',
      importInProgress: 'importInProgress',
      importCompletedNoErr: 'importCompletedNoErr',
      importCompletedWithErr: 'importCompletedWithErr'
    };

    WebExApiGatewayConstsService.csvStatusTypes = [
      WebExApiGatewayConstsService.csvStates.none,
      WebExApiGatewayConstsService.csvStates.exportInProgress,
      WebExApiGatewayConstsService.csvStates.exportCompletedNoErr,
      WebExApiGatewayConstsService.csvStates.exportCompletedWithErr,
      WebExApiGatewayConstsService.csvStates.importInProgress,
      WebExApiGatewayConstsService.csvStates.importCompletedNoErr,
      WebExApiGatewayConstsService.csvStates.importCompletedWithErr
    ];

    spyOn(Auth, 'redirectToLogin');
    spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue(fakeConferenceServicesArray);
    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue("nobody@nowhere.com");
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(WebExUtilsFact, "getAllSitesWebexLicenseInfo").and.returnValue(deferred_licenseInfo.promise);
    spyOn(WebExApiGatewayService, 'siteFunctions').and.returnValue(deferredIsSiteSupportsIframe.promise);
    spyOn(WebExApiGatewayService, 'csvStatus').and.returnValue(deferredCsvStatus.promise);
    spyOn(WebExUtilsFact, "isCIEnabledSite").and.callFake(function (siteUrl) {
      if (siteUrl === "sjsite04.webex.com") {
        return true;
      } else if (siteUrl === "t30citestprov9.webex.com") {
        return false;
      }
    });
  }));

  ////////

  it('can correctly initialize WebExSiteRowService', function () {
    expect(WebExSiteRowService).toBeDefined();
  });

  it('can correctly populate site rows', function () {
    WebExSiteRowService.addSiteRow(fakeSiteRow1);
    WebExSiteRowService.addSiteRow(fakeSiteRow2);
    var siteRowArray = WebExSiteRowService.getSiteRows();
    expect(siteRowArray.length).toBe(2);
  });

  it('can correctly get specified site row', function () {
    WebExSiteRowService.addSiteRow(fakeSiteRow1);
    WebExSiteRowService.addSiteRow(fakeSiteRow2);
    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");
    expect(searchResult.license.licenseId).toBe("MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com");
  });

  it('can correctly create site list grid', function () {
    WebExSiteRowService.getConferenceServices();

    var siteRowArray = WebExSiteRowService.getSiteRows();
    expect(siteRowArray.length).toBe(1);

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");
    expect(searchResult.license.licenseId).toBe("MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com");
  });

  /////////// isIframeSupported, isAdminReportEnabled flags' tests ////////////

  it('can process isIframeSupported=false and isAdminReportEnabled=false', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: false,
      isAdminReportEnabled: false,
      isCSVSupported: false
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.isIframeSupported).toEqual(false);
    expect(searchResult.isAdminReportEnabled).toEqual(false);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=false and isAdminReportEnabled=true', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: false,
      isAdminReportEnabled: true,
      isCSVSupported: false
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.isIframeSupported).toEqual(false);
    expect(searchResult.isAdminReportEnabled).toEqual(true);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=false', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: false,
      isCSVSupported: false
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.isIframeSupported).toEqual(true);
    expect(searchResult.isAdminReportEnabled).toEqual(false);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=true', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: false
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.isIframeSupported).toEqual(true);
    expect(searchResult.isAdminReportEnabled).toEqual(true);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  /////////// CSV Tests ///////////

  it('can set up csv status polling', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvPollIntervalObj).not.toEqual(null);
  });

  it('can process csvStatus="none"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.none,
      completionDetails: null,
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");
    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.none);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportInProgress"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.exportInProgress,
      completionDetails: null,
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.exportInProgress);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedNoErr"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.exportCompletedNoErr,
      completionDetails: {},
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.exportCompletedNoErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedWithErr"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.exportCompletedWithErr,
      completionDetails: {},
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.exportCompletedWithErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importInProgress"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.importInProgress,
      completionDetails: null,
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.importInProgress);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedNoErr"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.importCompletedNoErr,
      completionDetails: {},
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.importCompletedNoErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedWithErr"', function () {
    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: WebExApiGatewayConstsService.csvStates.importCompletedWithErr,
      completionDetails: {},
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    expect(searchResult.csvStatusObj.status).toEqual(WebExApiGatewayConstsService.csvStates.importCompletedWithErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process "Auth token is invalid"', function () {

    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    deferredCsvStatus.reject({
      siteUrl: 'sjsite04.webex.com',
      status: 'error',
      errorCode: '060502',
      errorDesc: 'Auth token is invalid.',
      completionDetails: null
    });

    $rootScope.$apply();

    expect(Auth.redirectToLogin).toHaveBeenCalled();
  });

  it('can process multiple licensed services', function () {

    WebExSiteRowService.getConferenceServices();
    WebExSiteRowService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "sjsite04.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    $rootScope.$apply();

    var searchResult = WebExSiteRowService.getSiteRow("sjsite04.webex.com");

    // sjsite04.webex.com has MC 200 and CMR 100 licenses
    expect(searchResult.MCLicensed).toBe(true);
    expect(searchResult.CMRLicensed).toBe(true);
    expect(searchResult.multipleWebexServicesLicensed).toBe(true);
    expect(searchResult.licenseTypeContentDisplay).toBe("siteList.multipleLicenses");
    expect(searchResult.licenseTooltipDisplay).toBe("helpdesk.licenseDisplayNames.MC<br>helpdesk.licenseDisplayNames.CMR");

  });

  //test to determine CI sites 
  it('can correctly determine CI sites and display the actions column in sitelist page', function () {
    var fakeSiteUrl = "sjsite04.webex.com";
    var searchResult = WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
    expect(searchResult).toBe(true);

    WebExApiGatewayService.siteFunctions(fakeSiteUrl).then(function (e) {
      expect(WebExSiteRowService.siteFunctionsSuccess).toHaveBeenCalled();
      expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    });
  });

  it('can correctly determine non CI sites and give cross launch link in the actions column', function () {
    var fakeSiteUrl = "t30citestprov9.webex.com";
    var searchResult = WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
    expect(searchResult).toBe(false);

    WebExApiGatewayService.siteFunctions(fakeSiteUrl).then(function (e) {
      expect(WebExSiteRowService.siteFunctionsSuccess).toHaveBeenCalled();
      expect(WebExSiteRowService.updateCSVStatusInRow).not.toHaveBeenCalled();
    });
  });

});
