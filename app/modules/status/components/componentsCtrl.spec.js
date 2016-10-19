'use strict';

describe('controller:componentsCtrl', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var ComponentsService;
  var $modal;
  var $state;
  var $q;
  var modalDefer;
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _ComponentsService_, _$modal_, _$q_, _$state_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    ComponentsService = _ComponentsService_;
    $modal = _$modal_;
    $q = _$q_;
    $state = _$state_;
    controller = $controller('componentsCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService,
    });
    spyOn(ComponentsService, 'getComponents').and.callThrough();
    spyOn(statusService, 'getServiceId').and.returnValue($q.when({}));
    modalDefer = $q.defer();
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn($state, 'go');
  }
  it('addComponent should call $modal', function () {
    controller.addComponent();
     //expect(statusService.getServiceId).toHaveBeenCalled();
    expect($modal.open).toHaveBeenCalled();
  });
  it('updateComponent should call $modal', function () {
    controller.updateComponent();
    //expect(statusService.getServiceId).toHaveBeenCalled();
    expect($modal.open).toHaveBeenCalled();
  });
  it('deleteComponent should call go', function () {
    controller.delComponent();
    //$scope.$apply();
    expect($state.go).toHaveBeenCalled();
  });
});
