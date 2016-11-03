'use strict';

describe('Controller: customerSubscriptionsDetailCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  var controller, $controller, $scope, $q, Auth, CustomerAdministratorService, Userservice;
  var customerResponseTest = getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json');
  var customerAdmins = {
    data: {
      Resources: [{
        name: {
          givenName: 'Jane',
          familyName: 'Doe'
        }
      }, {
        name: {
          givenName: 'John',
          familyName: 'Doe'
        },
      }]
    }
  };

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _Auth_, _CustomerAdministratorService_, _Userservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    Auth = _Auth_;
    Userservice = _Userservice_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    spyOn(Auth, 'getCustomerAccount').and.returnValue($q.when({ data: customerResponseTest }));
    spyOn(CustomerAdministratorService, 'getCustomerAdmins').and.returnValue($q.when(customerAdmins));
    spyOn(Userservice, 'getPrimaryEmailFromUser').and.returnValue('email@email.net');

  }));
  function initController() {
    controller = $controller('CustomerSubscriptionsDetailCtrl', {
      $scope: $scope,
      $stateParams: {
        currentCustomer: {}
      }
    });
    $scope.$apply();
  }
  describe('getSubscriptions', function () {
    beforeEach(initController);
    it('must push customerSubscriptions into View-Model subscriptions array', function () {
      expect(controller).toBeDefined();
      expect(controller.getSubscriptions).toBeDefined();
      expect(controller.subscriptions).toBeDefined();
      expect(controller.subscriptions[0].siteUrl).toEqual('AtlasTestRitwchau05.webex.com');
      expect(controller.subscriptions[0].subscriptionId).toEqual('Test-Sub-08072016a');
    });
    it('must only put unique siteUrl/subscriptionID combinations array', function () {
      expect(controller.subscriptions.length).toEqual(2);
      expect(controller.subscriptions[1].subscriptionId).toEqual('Test-Sub-08072016b');
    });
    it('must return array of names and emails', function () {
      expect(controller.partnerAdmins.length).toEqual(2);
      expect(controller.partnerAdmins[1].email).toEqual('email@email.net');
    });
    it('has a join array function that can join 1 level nested array', function () {
      var inner = ['inner1', 'inner2'];
      var arr = ['one', 'two', inner, 'three'];
      var result = controller._helpers.flattenAndJoin(arr, 'banana');
      expect(result).toEqual('onebananatwobananainner1bananainner2bananathree');
    });
  });
});
