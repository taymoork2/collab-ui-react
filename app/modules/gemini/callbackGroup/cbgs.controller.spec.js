'use strict';

describe('controller: CbgsCtrl', function () {
  var $q, defer, $scope, $controller, $state, $stateParams, controller, cbgService, Notification;
  var callbackGroups = getJSONFixture('gemini/callbackGroups.json');
  var currentCallbackGroup = {
    "callbackGroupSites": [],
    "ccaGroupId": "ff808081552e92e101552efcdb750081",
    "customerAttribute": null,
    "customerName": "Test-Feng",
    "groupName": "CB_11111_Test-Feng",
    "status": "P",
    "totalSites": 0
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$state_, _$stateParams_, _cbgService_, _Notification_) {
    $q = _$q_;
    $state = _$state_;
    defer = $q.defer();
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
  }

  function initSpecs() {
    spyOn($state, 'go').and.returnValue($q.when());
    spyOn(Notification, 'errorResponse').and.returnValue($q.when());
    spyOn(cbgService, 'getCallbackGroups').and.returnValue(defer.promise);
  }


  function initController() {
    controller = $controller("CbgsCtrl", {
      $scope: $scope,
      cbgService: cbgService
    });
  }

  it('onRequest should have been called with gem.modal.request', function () {
    controller.onRequest();
    expect($state.go).toHaveBeenCalledWith('gem.modal.request', jasmine.any(Object));
  });

  it('showCbgDetails should have been called', function () {
    $scope.showCbgDetails(currentCallbackGroup);
    expect($state.go).toHaveBeenCalled();
  });

  it('gridRefresh should be false', function () {
    defer.resolve(callbackGroups);
    controller.gridRefresh = true;
    $scope.$apply();
    expect(controller.gridRefresh).toBe(false);
  });

  it('filter should be execute', function () {
    defer.resolve(callbackGroups);
    $scope.gridData_ = currentCallbackGroup;
    controller.searchStr = 'Test-Feng';
    controller.gridRefresh = true;
    $scope.$apply();
    expect(controller.gridRefresh).toBe(false);
  });

  it('The response have message', function () {
    defer.reject({});
    $stateParams.customerId = "aaa";
    controller.gridRefresh = false;
    $scope.$apply();
    expect(controller.gridRefresh).toBe(true);
    expect(Notification.errorResponse).toHaveBeenCalled();
  });

});
