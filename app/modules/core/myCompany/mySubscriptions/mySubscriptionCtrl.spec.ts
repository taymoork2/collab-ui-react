import { IProdInst } from 'modules/online/upgrade/upgrade.service';

describe('Controller: MySubscriptionCtrl', function () {
  const onlineIntSubId: string = 'intSubId';
  const trialUrl: string = 'https://atlas-intb.ciscospark.com/admin/api/v1/commerce/online/' + onlineIntSubId;
  const trialUrlResponse: string = 'trialUrlResponse';
  const drUrlResponse: string = 'drUrlResponse';
  const ccwTrialSubId: string = 'Trial';
  const productInstanceId: string = 'productInstanceId';
  const productName: string = 'productName';
  const productInstanceResponse: IProdInst = {
    productInstanceId: productInstanceId,
    name: productName,
  };

  beforeEach(function () {
    this.initModules('Core', 'Hercules', 'Sunlight', 'WebExApp');
    this.injectDependencies('$controller',
      '$httpBackend',
      '$rootScope',
      '$scope',
      '$window',
      '$q',
      'Authinfo',
      'DigitalRiverService',
      'FeatureToggleService',
      'OnlineUpgradeService',
      'Orgservice',
      'ServiceDescriptor',
      'SharedMeetingsReportService',
      'WebExUtilsFact');

    this.data = _.cloneDeep(getJSONFixture('core/json/myCompany/subscriptionData.json'));
    this.siteUrl = 'siteUrl';

    spyOn(this.ServiceDescriptor, 'getServices').and.returnValue(this.$q.when(this.data.servicesResponse));
    spyOn(this.FeatureToggleService, 'atlasSharedMeetingsGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.FeatureToggleService, 'atlasSharedMeetingsReportsGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.OnlineUpgradeService, 'getProductInstance').and.returnValue(this.$q.when(productInstanceResponse));
    spyOn(this.Authinfo, 'getUserId').and.returnValue('12345');
    spyOn(this.DigitalRiverService, 'getSubscriptionsUrl').and.returnValue(this.$q.when(drUrlResponse));
    spyOn(this.$rootScope, '$broadcast').and.callThrough();

    spyOn(this.SharedMeetingsReportService, 'openModal');
    spyOn(this.WebExUtilsFact, 'getSiteAdminUrl').and.returnValue(this.siteUrl);
    spyOn(this.$window, 'open');

    this.startController = (): void => {
      this.controller = this.$controller('MySubscriptionCtrl', {
        $scope: this.$scope,
        $rootScope: this.$rootScope,
        $window: this.$window,
        Orgservice: this.Orgservice,
        ServiceDescriptor: this.ServiceDescriptor,
        Authinfo: this.Authinfo,
        WebExUtilsFact: this.WebExUtilsFact,
      });
      this.$scope.$apply();
    };
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should initialize with expected data for ccw orgs', function () {
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsResponse));
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.licensesFormatted);
    expect(this.controller.subscriptionDetails).toEqual(this.data.subscriptionsFormatted);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online orgs', function () {
    this.data.subscriptionsResponse[0].internalSubscriptionId = onlineIntSubId;
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsResponse));
    this.data.subscriptionsFormatted[0].isOnline = true;
    this.data.subscriptionsFormatted[0].productInstanceId = productInstanceId;
    this.data.subscriptionsFormatted[0].name = productName;
    this.data.subscriptionsFormatted[0].changeplanOverride = drUrlResponse;
    this.data.subscriptionsFormatted[0].internalSubscriptionId = onlineIntSubId;
    this.data.subscriptionsFormatted[0].quantity = 100;
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.licensesFormatted);
    expect(this.controller.subscriptionDetails).toEqual(this.data.subscriptionsFormatted);

    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for ccw trial orgs', function () {
    this.data.subscriptionsTrialResponse[0].internalSubscriptionId = ccwTrialSubId;
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
    this.data.trialSubscriptionData[0].name = 'subscriptions.enterpriseTrial';
    this.data.trialSubscriptionData[0].internalSubscriptionId = ccwTrialSubId;
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.trialLicenseData);
    expect(this.controller.subscriptionDetails).toEqual(this.data.trialSubscriptionData);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online trial orgs', function () {
    this.data.subscriptionsTrialResponse[0].internalSubscriptionId = onlineIntSubId;
    this.$httpBackend.whenGET(trialUrl).respond(this.$q.when(trialUrlResponse));
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
    this.data.trialSubscriptionData[0].isOnline = true;
    this.data.trialSubscriptionData[0].upgradeTrialUrl = trialUrlResponse;
    this.data.trialSubscriptionData[0].productInstanceId = productInstanceId;
    this.data.trialSubscriptionData[0].name = productName;
    this.data.trialSubscriptionData[0].internalSubscriptionId = onlineIntSubId;
    this.data.trialSubscriptionData[0].quantity = 100;

    this.startController();
    this.$httpBackend.flush();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.trialLicenseData);
    expect(this.controller.subscriptionDetails).toEqual(this.data.trialSubscriptionData);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  describe('Tests for Named User Licenses : ', function () {
    let dataWithNamedUserLicense = { offers: [{ licenseModel: 'hosts' }] };
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();
    });

    it('The isSharedMeetingsLicense() function should return false for a service that does not have shared Licenses ', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithNamedUserLicense.offers[0])).toEqual(false);
    });

    it('The determineLicenseType() function should return licenseType Named User License string', function () {
      let result = this.controller.determineLicenseType(dataWithNamedUserLicense.offers[0]);
      expect(result).toEqual('firstTimeWizard.namedLicenses');
    });
  });

  describe('Tests for Shared Meeting Licenses : ', function () {
    let dataWithSharedMeetingsLicense = { offers: [{ licenseModel: 'Cloud Shared Meeting' }] };
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();
    });

    it('The isSharedMeetingsLicense() function should return true for a service that has shared licenses', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithSharedMeetingsLicense.offers[0])).toEqual(true);
    });

    it('The determineLicenseType() function should return licenseType Shared Meeting License string', function () {
      let result = this.controller.determineLicenseType(dataWithSharedMeetingsLicense.offers[0]);
      expect(result).toEqual('firstTimeWizard.sharedLicenses');
    });
  });

  describe('Helper Functions - ', function () {
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();
    });

    it('launchSharedMeetingsLicenseUsageReport - should open a modal when the shared meeting report is launched', function () {
      this.controller.launchSharedMeetingsLicenseUsageReport(this.siteUrl);
      expect(this.SharedMeetingsReportService.openModal).toHaveBeenCalledWith(this.siteUrl);
    });

    it('hideUsage - should return true only if isCI is defined and false', function () {
      expect(this.controller.hideUsage({ isCI: false })).toBeTruthy();
      expect(this.controller.hideUsage({ isCI: true })).toBeFalsy();
      expect(this.controller.hideUsage({})).toBeFalsy();
    });

    it('nonCISignIn - should open new page', function () {
      this.controller.nonCISignIn({ siteUrl: this.siteUrl });
      expect(this.$window.open).toHaveBeenCalledWith(this.siteUrl, '_blank');
      expect(this.WebExUtilsFact.getSiteAdminUrl).toHaveBeenCalledWith(this.siteUrl);
    });

    it('showCategory - should only display a licenseCategory that has offers', function () {
      expect(this.controller.showCategory(this.data.trialLicenseData[0])).toBeTruthy();
      expect(this.controller.showCategory(this.data.licensesFormatted[1])).toBeTruthy();
      expect(this.controller.showCategory(this.data.trialLicenseData[1])).toBeFalsy();
    });

    it('getWarning - should return true when usage exceeds volume', function () {
      expect(this.controller.getWarning({
        usage: 50,
        volume: 20,
      })).toBeTruthy();
      expect(this.controller.getWarning({
        usage: 50,
        volume: 200,
      })).toBeFalsy();
    });
  });
});
