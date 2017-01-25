'use strict';

describe('controller: DelComponentCtrl', function () {
  var $controller, $q, $scope, $state, $stateParams, controller, ComponentsService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);


  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _$stateParams_, _ComponentsService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $stateParams = _$stateParams_;
    ComponentsService = _ComponentsService_;
  }

  function initSpies() {
    spyOn(ComponentsService, 'delComponent').and.returnValue($q.resolve());
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('DelComponentCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      ComponentsService: ComponentsService
    });

    $scope.$apply();
  }

  it('isValid true, confirm DELETE', function () {
    controller.delText = 'DELETE';

    expect(controller.isValid()).toBe(true);
  });

  it('isValid false, without confirmation', function () {
    expect(controller.isValid()).toBe(false);
  });


  it('delComponent isValid true, call delComponent service', function () {
    controller.delText = 'DELETE';

    controller.delComponent();
    expect(ComponentsService.delComponent).toHaveBeenCalled();
  });

  it('delComponent isValid false, don\'t call delComponent service', function () {
    controller.delComponent();
    expect(ComponentsService.delComponent.calls.count()).toEqual(0);
  });

  it('goBack, should go back', function () {
    controller.goBack();
    expect($state.go).toHaveBeenCalledWith('^');
  });
});
