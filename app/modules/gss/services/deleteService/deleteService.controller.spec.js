'use strict';

describe('controller: DeleteServiceCtrl', function () {
  var $controller, $q, $scope, $state, $stateParams, controller, GSSService;
  var testData = {
    deleteCommand: 'DELETE',
    serviceForDelete: {
      serviceId: 'testServiceId',
    },
  };

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  afterAll(function () {
    testData = undefined;
  });
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _$stateParams_, _GSSService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $stateParams = _$stateParams_;
    GSSService = _GSSService_;
  }

  function destructDI() {
    $controller = $q = $scope = $state = $stateParams = controller = GSSService = undefined;
  }

  function initSpies() {
    spyOn(GSSService, 'deleteService').and.returnValue($q.resolve());
    spyOn($state, 'go');
    spyOn($scope, '$emit').and.callThrough();
  }

  function initController() {
    controller = $controller('DeleteServiceCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      GSSService: GSSService,
    });

    $scope.$apply();
  }

  it('isValid true, with right confirm text', function () {
    controller.confirmText = testData.deleteCommand;

    expect(controller.isValid()).toBe(true);
  });

  it('isValid false, without confirm text', function () {
    expect(controller.isValid()).toBe(false);
  });

  it('deleteService isValid true, call GSSService.deleteService', function () {
    controller.confirmText = testData.deleteCommand;
    controller.service = testData.serviceForDelete;

    controller.deleteService();
    expect(GSSService.deleteService).toHaveBeenCalled();

    $scope.$digest();
    expect($scope.$emit).toHaveBeenCalledWith('serviceDeleted');

    expect($state.go).toHaveBeenCalledWith('^');
  });

  it('deleteService isValid false, don\'t call GSSService.deleteService', function () {
    controller.deleteService();
    expect(GSSService.deleteService.calls.count()).toEqual(0);
  });
});
