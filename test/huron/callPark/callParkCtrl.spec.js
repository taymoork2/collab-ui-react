'use strict';

describe('Controller: CallParkCtrl', function () {
  var controller, $rootScope, $scope, $modal, $q, CallPark, modalDefer;

  var rangedCallParks = [{
    "retrievalPrefix": "*",
    "pattern": "1005 - 1007",
    "description": "Bay View North",
    "data": [{
      "retrievalPrefix": "*",
      "pattern": "1005",
      "description": "Bay View North",
      "routePartition": null,
      "uuid": "e2664243-537a-4124-bf42-8b5c8698a6f0",
      "revertCss": null,
      "reversionPattern": null,
      "links": [{
        "rel": "voice",
        "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/e2664243-537a-4124-bf42-8b5c8698a6f0"
      }]
    }, {
      "retrievalPrefix": "*",
      "pattern": "1006",
      "description": "Bay View North",
      "routePartition": null,
      "uuid": "3e378179-b155-47c8-83dd-ca48ccfb79c3",
      "revertCss": null,
      "reversionPattern": null,
      "links": [{
        "rel": "voice",
        "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/3e378179-b155-47c8-83dd-ca48ccfb79c3"
      }]
    }, {
      "retrievalPrefix": "*",
      "pattern": "1007",
      "description": "Bay View North",
      "routePartition": null,
      "uuid": "80937dac-f13e-4b01-98a9-6a279cb39bfa",
      "revertCss": null,
      "reversionPattern": null,
      "links": [{
        "rel": "voice",
        "href": "/api/v1/voice/customers/ff78e1be-d2ff-45db-bf4f-b3c95416c311/directedcallparks/80937dac-f13e-4b01-98a9-6a279cb39bfa"
      }]
    }]
  }];

  beforeEach(module('uc.callpark'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _CallPark_, _$modal_, _$q_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $modal = _$modal_;
    CallPark = _CallPark_;
    modalDefer = $q.defer();

    spyOn(CallPark, 'list').and.returnValue($q.when([]));
    spyOn(CallPark, 'remove').and.returnValue($q.when());
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn($rootScope, '$broadcast').and.callThrough();

    controller = $controller('CallParkCtrl', {
      $scope: $scope,
      CallPark: CallPark
    });

    $scope.$apply();
  }));

  describe('listCallParks', function () {
    it('should list no call parks', function () {
      controller.listCallParks();
      $scope.$apply();
      expect(controller.showInformation).toBe(true);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('callrouting-update', {
        state: 'callpark',
        count: 0
      });
    });

    it('should list some call parks', function () {
      CallPark.list.and.returnValue($q.when(rangedCallParks));
      controller.listCallParks();
      $scope.$apply();
      expect(controller.showInformation).toBe(false);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('callrouting-update', {
        state: 'callpark',
        count: 3
      });
    });
  });

  describe('addCallPark', function () {
    it('should list call parks on success', function () {
      controller.addCallPark();
      modalDefer.resolve();
      $scope.$apply();
      expect(CallPark.list).toHaveBeenCalled();
    });

    it('should list call parks on cancel', function () {
      controller.addCallPark();
      modalDefer.reject();
      $scope.$apply();
      expect(CallPark.list).toHaveBeenCalled();
    });
  });

  describe('deleteCallPark', function () {
    it('should remove call park on success', function () {
      controller.deleteCallPark();
      modalDefer.resolve();
      $scope.$apply();
      expect(CallPark.remove).toHaveBeenCalled();
    });

    it('should not remove call park on cancel', function () {
      controller.deleteCallPark();
      modalDefer.reject();
      $scope.$apply();
      expect(CallPark.remove).not.toHaveBeenCalled();
    });
  });

  describe('toggleInformation', function () {
    it('should toggle showInformation', function () {
      expect(controller.showInformation).toBe(true);
      controller.toggleInformation();
      expect(controller.showInformation).toBe(false);
    });
  });

});
