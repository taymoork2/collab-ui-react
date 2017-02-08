'use strict';

describe('Controller: MySubscriptionCtrl', function () {
  let $httpBackend, rootScope, $scope, $controller, $q, controller, DigitalRiverService, OnlineUpgradeService, Orgservice, ServiceDescriptor, Authinfo, FeatureToggleService;
  let data = getJSONFixture('core/json/myCompany/subscriptionData.json');
  let trialUrl = 'https://atlas-integration.wbx2.com/admin/api/v1/commerce/online/intSubID';
  let trialUrlResponse = 'trialUrlResponse';
  let productInstanceResponse = 'productInstanceResponse';
  let drUrlResponse = 'drUrlResponse';

  data.licensesFormatted.forEach(function (item){
    item.subscriptions[0].siteUrl = undefined;
  });
  data.licensesFormatted[1].subscriptions[0].offers[0].siteUrl = undefined;
  data.trialLicenseData[0].subscriptions[0].siteUrl = undefined;

  data.subscriptionsFormatted[0].licenses[0].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[1].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[7].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[8].siteUrl = undefined;
  data.subscriptionsFormatted[0].upgradeTrialUrl = undefined;
  data.subscriptionsFormatted[0].productInstanceId = undefined;
  data.subscriptionsFormatted[0].changeplanOverride = undefined;
  data.trialSubscriptionData[0].licenses[0].siteUrl = undefined;
  data.trialSubscriptionData[0].upgradeTrialUrl = undefined;
  data.trialSubscriptionData[0].productInstanceId = undefined;
  data.trialSubscriptionData[0].changeplanOverride = undefined;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _DigitalRiverService_, _OnlineUpgradeService_, _Orgservice_, _ServiceDescriptor_, _Authinfo_, _FeatureToggleService_, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $controller = _$controller_;
    DigitalRiverService = _DigitalRiverService_;
    OnlineUpgradeService = _OnlineUpgradeService_;
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    $q = _$q_;

    spyOn(ServiceDescriptor, 'getServices').and.returnValue($q.when(data.servicesResponse));
    spyOn(FeatureToggleService, 'atlasSharedMeetingsGetStatus').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'atlasSharedMeetingsReportsGetStatus').and.returnValue($q.when(false));
    spyOn(OnlineUpgradeService, 'getProductInstanceId').and.returnValue($q.when(productInstanceResponse));
    spyOn(Authinfo, 'getUserId').and.returnValue('12345');
    spyOn(DigitalRiverService, 'getSubscriptionsUrl').and.returnValue($q.when(drUrlResponse));
    spyOn(rootScope, '$broadcast').and.callThrough();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  let startController = function () {
    controller = $controller('MySubscriptionCtrl', {
      $scope: $scope,
      $rootScope: rootScope,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor,
      Authinfo: Authinfo,
    });
  };

  it('should initialize with expected data for ccw orgs', function () {
    spyOn(Authinfo, 'isOnline').and.returnValue(false);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsResponse));
    startController();

    expect(controller.visibleSubscriptions).toBeFalsy();
    $scope.$apply();

    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.licensesFormatted);
    expect(controller.subscriptionDetails).toEqual(data.subscriptionsFormatted);
    expect(controller.visibleSubscriptions).toBeTruthy();
    expect(controller.isOnline).toBeFalsy();
    expect(rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online orgs', function () {
    spyOn(Authinfo, 'isOnline').and.returnValue(true);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsResponse));
    data.subscriptionsFormatted[0].isOnline = true;
    data.subscriptionsFormatted[0].productInstanceId = productInstanceResponse;
    data.subscriptionsFormatted[0].changeplanOverride = drUrlResponse;
    startController();
    $scope.$apply();

    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.licensesFormatted);
    expect(controller.subscriptionDetails).toEqual(data.subscriptionsFormatted);
    expect(controller.visibleSubscriptions).toBeTruthy();
    expect(controller.isOnline).toBeTruthy();
    expect(rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for ccw trial orgs', function () {
    spyOn(Authinfo, 'isOnline').and.returnValue(false);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsTrialResponse));
    startController();
    $scope.$apply();

    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.trialLicenseData);
    expect(controller.subscriptionDetails).toEqual(data.trialSubscriptionData);
    expect(controller.visibleSubscriptions).toBeTruthy();
    expect(controller.isOnline).toBeFalsy();
    expect(rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online trial orgs', function () {
    $httpBackend.whenGET(trialUrl).respond($q.when(trialUrlResponse));
    spyOn(Authinfo, 'isOnline').and.returnValue(true);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsTrialResponse));
    data.trialSubscriptionData[0].isOnline = true;
    data.trialSubscriptionData[0].upgradeTrialUrl = trialUrlResponse;
    data.trialSubscriptionData[0].productInstanceId = productInstanceResponse;

    startController();
    $scope.$apply();
    $httpBackend.flush();

    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.trialLicenseData);
    expect(controller.subscriptionDetails).toEqual(data.trialSubscriptionData);
    expect(controller.visibleSubscriptions).toBeTruthy();
    expect(controller.isOnline).toBeTruthy();
    expect(rootScope.$broadcast).toHaveBeenCalled();
  });

  describe('Tests for Named User Licenses : ', function () {
    let dataWithNamedUserLicense = { offers: [{ licenseModel: 'hosts' }] };

    it('The isSharedMeetingsLicense() function should return false for a service that does not have shared Licenses ', function () {
      expect(controller.isSharedMeetingsLicense(dataWithNamedUserLicense)).toEqual(false);
    });

    it('The determineLicenseType() function should return licenseType Named User License string', function () {
      let result = controller.determineLicenseType(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicenses');
    });
  });

  describe('Tests for Shared Meeting Licenses : ', function () {
    let dataWithSharedMeetingsLicense = { offers: [{ licenseModel: 'Cloud Shared Meeting' }] };

    it('The isSharedMeetingsLicense() function should return true for a service that has shared licenses', function () {
      expect(controller.isSharedMeetingsLicense(dataWithSharedMeetingsLicense)).toEqual(true);
    });

    it('The determineLicenseType() function should return licenseType Shared Meeting License string', function () {
      let result = controller.determineLicenseType(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicenses');
    });
  });

});
