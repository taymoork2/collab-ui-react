'use strict';

describe('Controller: MySubscriptionCtrl', function () {
  let $scope, $controller, q, controller, Orgservice, ServiceDescriptor, Authinfo;
  let data = getJSONFixture('core/json/myCompany/subscriptionData.json');
  let subId = 'sub-id';
  let subUrl = "http://gc.digitalriver.com/store?SiteID=ciscoctg&Action=DisplaySelfServiceSubscriptionLandingPage&futureAction=DisplaySelfServiceSubscriptionUpgradePage&subscriptionID=";

  data.licensesFormatted[0].subscriptions[0].siteUrl = undefined;
  data.licensesFormatted[1].subscriptions[0].siteUrl = undefined;
  data.licensesFormatted[1].subscriptions[0].offers[0].siteUrl = undefined;
  data.licensesFormatted[2].subscriptions[0].siteUrl = undefined;
  data.licensesFormatted[3].subscriptions[0].siteUrl = undefined;

  data.subscriptionsFormatted[0].licenses[0].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[1].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[7].siteUrl = undefined;
  data.subscriptionsFormatted[0].licenses[8].siteUrl = undefined;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(function ($rootScope, _$controller_, $q, _Orgservice_, _ServiceDescriptor_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;
    Authinfo = _Authinfo_;
    q = $q;

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue(q.when(data.subscriptionsResponse));
    spyOn(ServiceDescriptor, 'servicesInOrg').and.returnValue(q.when(data.servicesResponse));
  }));

  let startController = function () {
    controller = $controller('MySubscriptionCtrl', {
      $scope: $scope,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor,
      Authinfo: Authinfo
    });
  };

  it('should initialize with expected data', function () {
    spyOn(Authinfo, 'isOnline').and.returnValue(true);
    startController();

    expect(controller.visibleSubscriptions).toBeFalsy();
    $scope.$apply();

    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.licensesFormatted);
    expect(controller.subscriptionDetails).toEqual(data.subscriptionsFormatted);
    expect(controller.visibleSubscriptions).toBeTruthy();
    expect(controller.isOnline).toBeTruthy();
  });

  it('should return BMMP workaround URL', function () {
    expect(controller.upgradeUrl(subId)).toBe(subUrl + subId);
  });
});
