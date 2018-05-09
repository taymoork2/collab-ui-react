// TODO: this file needs to be revisited to:
// - add missing return types for functions
// - add missing types for function args
// - replace instances of `any` with better TS types as-appropriate
import testModule from './index';

describe('Service: SiteListService', () => {
  let deferred_licenseInfo, deferredIsSiteSupportsIframe, deferredCsvStatus;
  const customers = _.cloneDeep(getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json').customers);

  afterEach(function () {
    deferred_licenseInfo = deferredIsSiteSupportsIframe = deferredCsvStatus = undefined;
  });

  let fakeSiteRow1: any = {
    label: 'Meeting Center 200',
    value: 1,
    name: 'confRadio',
    license: {
      licenseId: 'MC_5320533d-da5d-4f92-b95e-1a42567c55a0_cisjsite031.webex.com',
      offerName: 'MC',
      licenseType: 'CONFERENCING',
      billingServiceId: '1446768353',
      features: ['cloudmeetings'],
      volume: 25,
      isTrial: false,
      status: 'ACTIVE',
      capacity: 200,
      siteUrl: 'cisjsite031.webex.com',
    },
    isCustomerPartner: false,
    showCSVInfo: true,
    csvStatusObj: null,
    csvPollIntervalObj: null,
    isIframeSupported: false,
    isAdminReportEnabled: false,
    showSiteLinks: true,
    isError: false,
    isWarn: false,
    isCSVSupported: false,
    adminEmailParam: 'sjsite14-lhsieh@mailinator.com',
    userEmailParam: 'sjsite14-lhsieh@mailinator.com',
    advancedSettings: 'https://cisjsite031.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    webexAdvancedUrl: 'https://cisjsite031.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    siteUrl: 'cisjsite031.webex.com',
    showLicenseTypes: true,
    multipleWebexServicesLicensed: false,
    licenseTypeContentDisplay: 'Meeting Center 200',
    licenseTooltipDisplay: null,
    MCLicensed: true,
    ECLicensed: false,
    SCLicensed: false,
    TCLicensed: false,
    EELicensed: false,
    CMRLicensed: false,
    csvMock: {
      mockStatus: false,
      mockStatusStartIndex: 0,
      mockStatusEndIndex: 0,
      mockStatusCurrentIndex: null,
      mockExport: false,
      mockImport: false,
      mockFileDownload: false,
    },
    $$hashKey: 'uiGrid-0007',
    showCSVIconAndResults: true,
  };
  let fakeSiteRow2: any = {
    label: 'Meeting Center 200',
    value: 1,
    name: 'confRadio',
    license: {
      licenseId: 'MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com',
      offerName: 'MC',
      licenseType: 'CONFERENCING',
      billingServiceId: 'SubCt30test201592301',
      features: ['cloudmeetings'],
      volume: 25,
      isTrial: false,
      status: 'ACTIVE',
      capacity: 200,
      siteUrl: 'sjsite04.webex.com',
    },
    isCustomerPartner: false,
    showCSVInfo: true,
    csvStatusObj: {
      siteUrl: 'sjsite04.webex.com',
      isMockResult: false,
      status: 'importCompletedWithErr',
      details: {
        jobType: 1,
        request: 2,
        errorLogLink: 'NDc2NyUlZXJyb3Jsb2c=',
        created: 1465596732000,
        started: 1465596877000,
        finished: 1465597477000,
        totalRecords: 20,
        successRecords: 0,
        failedRecords: 20,
        importFileName: 'NewSiteUsersU16LE.csv',
      },
    },
    csvPollIntervalObj: {
      $$state: {
        status: 2,
        value: 'canceled',
      },
      $$intervalId: 90,
    },
    isIframeSupported: true,
    isAdminReportEnabled: true,
    showSiteLinks: true,
    isError: false,
    isWarn: false,
    isCSVSupported: true,
    adminEmailParam: 'sjsite14-lhsieh@mailinator.com',
    userEmailParam: 'sjsite14-lhsieh@mailinator.com',
    advancedSettings: 'https://sjsite04.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    webexAdvancedUrl: 'https://sjsite04.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    siteUrl: 'sjsite04.webex.com',
    showLicenseTypes: true,
    multipleWebexServicesLicensed: true,
    licenseTypeContentDisplay: 'Multiple...',
    licenseTooltipDisplay: 'Meeting Center 200<br>Meeting Center 25',
    MCLicensed: true,
    ECLicensed: false,
    SCLicensed: false,
    TCLicensed: false,
    EELicensed: false,
    CMRLicensed: false,
    csvMock: {
      mockStatus: false,
      mockStatusStartIndex: 0,
      mockStatusEndIndex: 0,
      mockStatusCurrentIndex: null,
      mockExport: false,
      mockImport: false,
      mockFileDownload: false,
    },
    $$hashKey: 'uiGrid-0009',
    showCSVIconAndResults: true,
  };
  const pendingStatusSubscriptions = [
    {
      externalSubscriptionId: 'WX-12345',
      pendingServiceOrderUUID: 'abcd-12345',
    },
    {
      externalSubscriptionId: 'WX-67890',
      pendingServiceOrderUUID: 'efgh-67890',
    },
  ];
  const returnedServiceStatuses1 = {
    serviceStatus: [
      {
        siteUrl: 'abc.webex.com',
        license: {
          status: 'PROVISIONING',
        },
      },
      {
        siteUrl: 'abc.webex.com',
        license: {
          status: 'PROVISIONING',
        },
      },
    ],
  };
  const returnedServiceStatuses2 = {
    serviceStatus: [
      {
        siteUrl: 'sjsite04.webex.com',
        license: {
          status: 'PROVISIONING',
        },
      },
      {
        license: {
          status: 'PROVISIONING',
        },
      },
      {
        siteUrl: 'ghi.webex.com',
        license: {
          status: 'PROVISIONED',
        },
      },
    ],
  };
  const confServices = _.cloneDeep(getJSONFixture('core/json/authInfo/webexLicenses.json'));

//  var fakeConferenceService1 = {
//    "label": "Meeting Center 200",
//    "value": 1,
//    "name": "confRadio",
//    "license": {
//      "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_cisjsite031.webex.com",
//      "offerName": "MC",
//      "licenseType": "CONFERENCING",
//      "billingServiceId": "1446768353",
//      "features": ["cloudmeetings"],
//      "volume": 25,
//      "isTrial": false,
//      "status": "ACTIVE",
//      "capacity": 200,
//      "siteUrl": "cisjsite031.webex.com"
//    },
//    "isCustomerPartner": false
//  };
  let fakeConferenceService2: any = {
    label: 'Meeting Center 200',
    value: 1,
    name: 'confRadio',
    license: {
      licenseId: 'MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com',
      offerName: 'MC',
      licenseType: 'CONFERENCING',
      billingServiceId: 'SubCt30test201592301',
      features: ['cloudmeetings'],
      volume: 25,
      isTrial: false,
      status: 'ACTIVE',
      capacity: 200,
      siteUrl: 'sjsite04.webex.com',
    },
    isCustomerPartner: false,
  };
  let fakeConferenceServicesArray: any[] | undefined = [fakeConferenceService2];

  let fake_allSitesLicenseInfo: any = [{
    webexSite: 'sjsite04.webex.com',
    siteHasMCLicense: true,
    offerCode: 'MC',
    capacity: '200',
  }, {
    webexSite: 'cisjsite031.webex.com',
    siteHasMCLicense: true,
    offerCode: 'MC',
    capacity: '200',
  }, {
    webexSite: 'sjsite04.webex.com',
    siteHasMCLicense: true,
    offerCode: 'CMR',
    capacity: '100',
  }];

  afterAll(function () {
    fakeSiteRow1 = fakeSiteRow2 = fakeConferenceService2 = fakeConferenceServicesArray = fake_allSitesLicenseInfo = undefined;
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$rootScope',
      'Auth',
      'Authinfo',
      'FeatureToggleService',
      'SetupWizardService',
      'SiteListService',
      'UrlConfig',
      'WebExApiGatewayConstsService',
      'WebExApiGatewayService',
      'WebExUtilsFact',
    );
  });

  beforeEach(function () {
    deferred_licenseInfo = this.$q.defer();
    deferredIsSiteSupportsIframe = this.$q.defer();
    deferredCsvStatus = this.$q.defer();

    this.WebExApiGatewayConstsService.csvStates = {
      authTokenError: 'authTokenError',
      none: 'none',
      exportInProgress: 'exportInProgress',
      exportCompletedNoErr: 'exportCompletedNoErr',
      exportCompletedWithErr: 'exportCompletedWithErr',
      importInProgress: 'importInProgress',
      importCompletedNoErr: 'importCompletedNoErr',
      importCompletedWithErr: 'importCompletedWithErr',
    };

    this.WebExApiGatewayConstsService.csvStatusTypes = [
      this.WebExApiGatewayConstsService.csvStates.none,
      this.WebExApiGatewayConstsService.csvStates.exportInProgress,
      this.WebExApiGatewayConstsService.csvStates.exportCompletedNoErr,
      this.WebExApiGatewayConstsService.csvStates.exportCompletedWithErr,
      this.WebExApiGatewayConstsService.csvStates.importInProgress,
      this.WebExApiGatewayConstsService.csvStates.importCompletedNoErr,
      this.WebExApiGatewayConstsService.csvStates.importCompletedWithErr,
    ];

    spyOn(this.Auth, 'redirectToLogin');
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue(fakeConferenceServicesArray);
    spyOn(this.Authinfo, 'getCustomerAccounts').and.returnValue(customers);
    spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue('nobody@nowhere.com');
    spyOn(this.Authinfo, 'getUserName').and.returnValue('bob@nonmatching-email.com');
    spyOn(this.FeatureToggleService, 'atlasWebexAddSiteGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.Authinfo, 'getCustomerAdminEmail').and.returnValue('bob@nonmatching-email.com');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.WebExApiGatewayService, 'siteFunctions').and.returnValue(deferredIsSiteSupportsIframe.promise);
    spyOn(this.WebExApiGatewayService, 'csvStatus').and.returnValue(deferredCsvStatus.promise);
    spyOn(this.WebExUtilsFact, 'getAllSitesWebexLicenseInfo').and.returnValue(deferred_licenseInfo.promise);
    spyOn(this.WebExUtilsFact, 'isCIEnabledSite').and.callFake(function (siteUrl) {
      if (siteUrl === 'sjsite04.webex.com') {
        return true;
      } else if (siteUrl === 't30citestprov9.webex.com') {
        return false;
      }
    });
    spyOn(this.SetupWizardService, 'getConferenceLicensesBySubscriptionId').and.returnValue(confServices);
    installPromiseMatchers();
  });

  it('can correctly initialize SiteListService', function () {
    expect(this.SiteListService).toBeDefined();
  });

  it('can correctly populate site rows', function () {
    this.SiteListService.addSiteRow(fakeSiteRow1);
    this.SiteListService.addSiteRow(fakeSiteRow2);
    const siteRowArray = this.SiteListService.getSiteRows();
    expect(siteRowArray.length).toBe(2);
  });

  it('can correctly get specified site row', function () {
    this.SiteListService.addSiteRow(fakeSiteRow1);
    this.SiteListService.addSiteRow(fakeSiteRow2);
    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');
    expect(searchResult.license.licenseId).toBe('MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com');
  });

  it('can correctly create site list grid', function () {
    this.SiteListService.getConferenceServices();

    const siteRowArray = this.SiteListService.getSiteRows();
    expect(siteRowArray.length).toBe(1);

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');
    expect(searchResult.license.licenseId).toBe('MC_66e1a7c9-3549-442f-942f-41a53b020689_sjsite04.webex.com');
  });

  it('can correctly create site list grid with linked site', function () {
    const fakeLinkedConferenceService = {
      label: 'Meeting Center 200',
      value: 1,
      name: 'confRadio',
      license: {
        licenseId: 'MC_5320533d-da5d-4f92-b95e-1a42567c55a0_cisjsite031.webex.com',
        offerName: 'MC',
        licenseType: 'CONFERENCING',
        billingServiceId: '1446768353',
        features: ['cloudmeetings'],
        volume: 25,
        isTrial: false,
        status: 'ACTIVE',
        capacity: 200,
        linkedSiteUrl: 'sjsite07.webex.com',
      },
      isCustomerPartner: false,
    };
    spyOn(this.Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue([fakeLinkedConferenceService]);

    this.SiteListService.getLinkedConferenceServices();

    const siteRowArray = this.SiteListService.getSiteRows();
    expect(siteRowArray.length).toBe(1);

    const searchResult = this.SiteListService.getSiteRow('sjsite07.webex.com');
    expect(searchResult.isLinkedSite).toBeTruthy();
  });

  it('should get list of managed webex sites', function() {
    const sites = [{ siteUrl: 'atlastest2.dmz.webex.com', subscriptionId: 'Subscription-2' }];
    const managedSites = this.SiteListService.getManagedSites();
    expect(this.Authinfo.getCustomerAccounts).toHaveBeenCalled();
    expect(sites).toEqual(managedSites);
  });

  it('should have managed site', function() {
    const siteUrl = 'atlastest2.dmz.webex.com';
    const managedSite = this.SiteListService.canManageSite(siteUrl);
    expect(managedSite).toBe(true);
  });

  it('should have managed subscription', function() {
    const subscriptionId = 'Subscription-2';
    const managedSubscription = this.SiteListService.canManageSubscription(subscriptionId);
    expect(managedSubscription).toBe(true);
  });

  /////////// isIframeSupported, isAdminReportEnabled flags' tests ////////////

  it('can process isIframeSupported=false and isAdminReportEnabled=false', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: false,
      isAdminReportEnabled: false,
      isCSVSupported: false,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.isIframeSupported).toEqual(false);
    expect(searchResult.isAdminReportEnabled).toEqual(false);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=false and isAdminReportEnabled=true', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'fake.webex.com',
      isIframeSupported: false,
      isAdminReportEnabled: true,
      isCSVSupported: false,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.isIframeSupported).toEqual(false);
    expect(searchResult.isAdminReportEnabled).toEqual(true);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=false', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'fake.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: false,
      isCSVSupported: false,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.isIframeSupported).toEqual(true);
    expect(searchResult.isAdminReportEnabled).toEqual(false);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=true', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'fake.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: false,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.isIframeSupported).toEqual(true);
    expect(searchResult.isAdminReportEnabled).toEqual(true);
    expect(searchResult.isCSVSupported).toEqual(false);

    expect(searchResult.showSiteLinks).toEqual(true);
    expect(searchResult.showCSVInfo).toEqual(true);
  });

  /////////// CSV Tests ///////////

  it('can set up csv status polling', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvPollIntervalObj).not.toEqual(null);
  });

  it('can process csvStatus="none"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.none,
      completionDetails: null,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');
    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.none);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportInProgress"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.exportInProgress,
      completionDetails: null,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.exportInProgress);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedNoErr"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.exportCompletedNoErr,
      completionDetails: {},
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.exportCompletedNoErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedWithErr"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.exportCompletedWithErr,
      completionDetails: {},
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.exportCompletedWithErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importInProgress"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.importInProgress,
      completionDetails: null,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.importInProgress);
    expect(searchResult.csvStatusObj.completionDetails).toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedNoErr"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.importCompletedNoErr,
      completionDetails: {},
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.importCompletedNoErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedWithErr"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.resolve({
      siteUrl: 'sjsite04.webex.com',
      status: this.WebExApiGatewayConstsService.csvStates.importCompletedWithErr,
      completionDetails: {},
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    expect(searchResult.csvStatusObj.status).toEqual(this.WebExApiGatewayConstsService.csvStates.importCompletedWithErr);
    expect(searchResult.csvStatusObj.completionDetails).not.toEqual(null);

    expect(searchResult.showCSVInfo).toEqual(true);
  });

  // TODO: restore this after CSCvd83672 is deployed to WebEx production
  // - see also: https://jira-eng-chn-sjc1.cisco.com/jira/projects/ATLAS/issues/ATLAS-2022
  xit('can process "Auth token is invalid"', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    deferredCsvStatus.reject({
      siteUrl: 'sjsite04.webex.com',
      status: 'error',
      errorId: '060502',
      errorDesc: 'Auth token is invalid.',
      completionDetails: null,
    });

    this.$rootScope.$apply();

    expect(this.Auth.redirectToLogin).toHaveBeenCalled();
  });

  it('can process multiple licensed services', function () {
    this.SiteListService.getConferenceServices();
    this.SiteListService.configureGrid();

    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: 'sjsite04.webex.com',
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true,
    });

    this.$rootScope.$apply();

    const searchResult = this.SiteListService.getSiteRow('sjsite04.webex.com');

    // sjsite04.webex.com has MC 200 and CMR 100 licenses
    expect(searchResult.MCLicensed).toBe(true);
    expect(searchResult.CMRLicensed).toBe(true);
    expect(searchResult.multipleWebexServicesLicensed).toBe(true);
    expect(searchResult.licenseTypeContentDisplay).toBe('siteList.multipleLicenses');
    expect(searchResult.licenseTooltipDisplay).toBe('helpdesk.licenseDisplayNames.MC<br>helpdesk.licenseDisplayNames.CMR');
  });

  //test to determine CI sites
  it('can correctly determine CI sites and display the actions column in sitelist page', function () {
    const fakeSiteUrl = 'sjsite04.webex.com';
    const searchResult = this.WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
    expect(searchResult).toBe(true);

    this.WebExApiGatewayService.siteFunctions(fakeSiteUrl).then(function () {
      expect(this.SiteListService.siteFunctionsSuccess).toHaveBeenCalled();
      expect(this.SiteListService.updateCSVStatusInRow).toHaveBeenCalled();
    });
  });

  it('can correctly determine non CI sites and give cross launch link in the actions column', function () {
    const fakeSiteUrl = 't30citestprov9.webex.com';
    const searchResult = this.WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
    expect(searchResult).toBe(false);

    this.WebExApiGatewayService.siteFunctions(fakeSiteUrl).then(function () {
      expect(this.SiteListService.siteFunctionsSuccess).toHaveBeenCalled();
      expect(this.SiteListService.updateCSVStatusInRow).not.toHaveBeenCalled();
    });
  });

  it('can group licenses by sites correctly', function () {
    const sites = this.SiteListService.getLicensesInSubscriptionGroupedBySites();
    expect(_.keys(sites).length).toEqual(3);
  });

  describe('For sites with pending action', () => {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'getPendingAuthinfoSubscriptions').and.returnValue(pendingStatusSubscriptions);
      spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('adminServiceUrl/');
      this.$httpBackend.expect('GET', 'adminServiceUrl/orders/abcd-12345').respond(returnedServiceStatuses1);
      this.$httpBackend.expect('GET', 'adminServiceUrl/orders/efgh-67890').respond(returnedServiceStatuses2);
    });
    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('displays them as pending action', function () {
      this.SiteListService.initSiteRows();
      this.$httpBackend.flush();
      expect(this.SiteListService.siteRows.gridData.length).toBe(3);
      expect(this.SiteListService.siteRows.gridData[0].isPending).toBe(true);
    });
  });

});
