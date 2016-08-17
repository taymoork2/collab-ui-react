'use strict';

fdescribe('Controller: customerSubscriptionsDetailCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  var controller, $controller, $scope, $q, $stateParams, Analytics, CustomerSubscriptionsService;
  var customerResponseTest = getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json');


  beforeEach(inject(function (_$controller_, $rootScope, _$q_,_CustomerSubscriptionsService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    CustomerSubscriptionsService = _CustomerSubscriptionsService_;


    var customerOrganizationId = 'd0e22b97-36cb-439a-abdd-9df7a9dc3a47';

    spyOn(CustomerSubscriptionsService, 'getSubscriptions').and.callFake(function (customerOrgId) {
      return customerResponseTest;
    });
  }));

  function initController() {
    controller = $controller('CustomerSubscriptionsDetailCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }

  describe('getSubscriptions', function () {
    beforeEach(initController);

    it('must push customerSubscriptions into View-Model subscriptions array', function () {
      controller.customerOrgId = customerOrganizationId;
    //expect(controller.subscriptions[0].trainSite).toEqual('AtlasTestRitwchau05.webex.com');
    //console.log('Hello');
    console.log(controller.subscriptions);
    //expect(controller.subscriptions[0].subscriptionId).toEqual('Test-Sub-08072016a');
    //expect(controller.subscriptions[0].offerName).toEqual('MC');

  });
  });
});
