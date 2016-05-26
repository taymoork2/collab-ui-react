'use strict';

describe('Controller: MyCompanyPageSubscriptionCtrl', function () {
  var $scope, controller, Orgservice, ServiceDescriptor;
  var data = getJSONFixture('core/json/myCompany/subscriptionData.json');
  data.subscriptionsFormatted[0].subscriptions[0].siteUrl = undefined;
  data.subscriptionsFormatted[1].subscriptions[0].siteUrl = undefined;
  data.subscriptionsFormatted[1].subscriptions[0].offers[0].siteUrl = undefined;
  data.subscriptionsFormatted[2].subscriptions[0].siteUrl = undefined;
  data.subscriptionsFormatted[3].subscriptions[0].siteUrl = undefined;

  beforeEach(module('Core'));
  beforeEach(module('Hercules'));

  beforeEach(inject(function ($rootScope, $controller, $q, _Orgservice_, _ServiceDescriptor_) {
    $scope = $rootScope.$new();
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(data.subscriptionsResponse));
    spyOn(ServiceDescriptor, 'servicesInOrg').and.returnValue($q.when(data.servicesResponse));

    controller = $controller('MyCompanyPageSubscriptionCtrl', {
      $scope: $scope,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor
    });

    $scope.$apply();
  }));

  it('should initialize with expected data', function () {
    expect(controller.hybridServices).toEqual(data.servicesFormatted);
    expect(controller.usageCategory).toEqual(data.subscriptionsFormatted);
  });
});
