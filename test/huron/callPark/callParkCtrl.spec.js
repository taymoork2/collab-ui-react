'use strict';

describe('Controller: CallParkCtrl', function () {
  var controller, $rootScope, $scope, $modal, $q, CallPark, modalDefer;

  var callParks = [{
    pattern: '111'
  }, {
    pattern: '222'
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
      CallPark.list.and.returnValue($q.when(callParks));
      controller.listCallParks();
      $scope.$apply();
      expect(controller.showInformation).toBe(false);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('callrouting-update', {
        state: 'callpark',
        count: 2
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
