'use strict';

describe('controller:ComponentsCtrl', function () {
  var $scope, $controller, $modal, $state, $q, controller, ComponentsService, GSSService;
  var component = {};
  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));
  beforeEach(initController);
  function dependencies(_$rootScope_, _$controller_, _$modal_, _$q_, _$state_, _ComponentsService_, _GSSService_) {
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $q = _$q_;
    $state = _$state_;
    $controller = _$controller_;

    GSSService = _GSSService_;
    ComponentsService = _ComponentsService_;
  }
  function initController() {
    controller = $controller('ComponentsCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      ComponentsService: ComponentsService,
    });

    spyOn(ComponentsService, 'getComponents').and.callThrough();
    spyOn(GSSService, 'getServiceId').and.returnValue($q.when({}));
    spyOn($modal, 'open').and.returnValue({
      result: $q.resolve()
    });
    spyOn($state, 'go');
  }
  it('addComponent should call $modal', function () {
    controller.addComponent();
    expect($modal.open).toHaveBeenCalled();
  });
  it('updateComponent should call $modal', function () {
    controller.updateComponent();
    expect($modal.open).toHaveBeenCalled();
  });
  it('deleteComponent should call go', function () {
    controller.delComponent(component);
    expect($state.go).toHaveBeenCalledWith('gss.components.deleteComponent', {
      component: component
    });
  });
});
