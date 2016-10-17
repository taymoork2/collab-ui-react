/**
 * Created by snzheng on 16/9/22.
 */

'use strict';

describe('controller:RedirectAddComponentCtrl', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var ComponentsService;
  var $q;
  var $modalInstance;
  var $stateParams, $state;
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _ComponentsService_, _$stateParams_, _$state_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    ComponentsService = _ComponentsService_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    $state = _$state_;
    $stateParams.component = {
      componentId: '461'
    };
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    spyOn(ComponentsService, 'delComponent').and.returnValue(
      $q.when({})
    );
    controller = $controller('RedirectDelComponentCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService,
      $state: $state,
      $stateParams: $stateParams,
      $modalInstance: $modalInstance
    });
    spyOn(controller, 'validation').and.returnValue(true);
  }

  it('validation should be active', function () {
    var validationResult = controller.validation();
    expect(validationResult).toBe(true);
  });

  it('deleteComponent should be active', function () {
    controller.delComponentBtnClicked();
    expect(ComponentsService.delComponent).toHaveBeenCalled();
  });
});
