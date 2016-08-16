'use strict';

describe('Controller: MySubscriptionCtrl', function () {
  let $httpBackend, rootScope, $scope, $controller, q, controller, Orgservice, ServiceDescriptor, Authinfo;
  let data = getJSONFixture('core/json/myCompany/subscriptionData.json');
  let subId = 'sub-id';
  let trialUrl = 'https://atlas-integration.wbx2.com/admin/api/v1/commerce/online/subID';
  let trialUrlResponse = 'trialUrlResponse';

  data.licensesFormatted.forEach(function (item, index){
    item.subscriptions[0].siteUrl = undefined;
  });
  data.licensesFormatted[1].subscriptions[0].offers[0].siteUrl = undefined;
  data.trialLicenseData[0].subscriptions[0].siteUrl = undefined;

  data.subscriptionsFormatted[0].licenses[0].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[1].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[7].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[8].siteUrl = undefined;
  data.subscriptionsFormatted[0].upgradeTrialUrl = undefined;
  data.trialSubscriptionData[0].licenses[0].siteUrl = undefined;
  data.trialSubscriptionData[0].upgradeTrialUrl = undefined;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, $q, _Orgservice_, _ServiceDescriptor_, _Authinfo_, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;
    Authinfo = _Authinfo_;
    q = $q;

    spyOn(ServiceDescriptor, 'servicesInOrg').and.returnValue(q.when(data.servicesResponse));
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
      Authinfo: Authinfo
    });
  };

  it('should initialize with expected data for ccw orgs', function () {
    spyOn(Authinfo, 'isOnline').and.returnValue(false);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue(q.when(data.subscriptionsResponse));
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
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue(q.when(data.subscriptionsResponse));
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
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue(q.when(data.subscriptionsTrialResponse));
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
    $httpBackend.whenGET(trialUrl).respond(q.when(trialUrlResponse));
    spyOn(Authinfo, 'isOnline').and.returnValue(true);
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue(q.when(data.subscriptionsTrialResponse));
    data.trialSubscriptionData[0].upgradeTrialUrl = trialUrlResponse;

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
});
