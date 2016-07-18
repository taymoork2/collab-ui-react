'use strict';

describe('Controller: MySubscriptionCtrl', function () {
  var $scope, controller, Orgservice, ServiceDescriptor;
  var data = getJSONFixture('core/json/myCompany/subscriptionData.json');
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

  beforeEach(inject(function ($rootScope, $controller, $q, _Orgservice_, _ServiceDescriptor_) {
    $scope = $rootScope.$new();
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsResponse));
    spyOn(ServiceDescriptor, 'servicesInOrg').and.returnValue($q.when(data.servicesResponse));

    controller = $controller('MySubscriptionCtrl', {
      $scope: $scope,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor
    });
  }));

  it('should initialize with expected data', function () {
    expect(controller.visibleSubscriptions).toBeFalsy();

    $scope.$apply();
    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.licenseCategory).toEqual(data.licensesFormatted);
    expect(controller.subscriptionDetails).toEqual(data.subscriptionsFormatted);
    expect(controller.visibleSubscriptions).toBeTruthy();
  });
});
