/**
 * Created by snzheng on 16/9/25.
 */
'use strict';

describe('controller:addServiceCtrl', function () {
  var controller;
  var $controller;
  var $scope;
  var statusService;
  var $modalInstance;
  var $q;
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$controller_, _statusService_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    $q = _$q_;
    controller = $controller('addServiceCtrl', {
      $scope: $scope,
      statusService: statusService,
      $modalInstance: $modalInstance
    });
    spyOn(controller, 'validation');
    spyOn(statusService, 'addService').and.returnValue($q.when({}));
  }
  it('closeAddModal should be active', function () {
    //spyOn($modalInstance, 'close');
    controller.closeAddModal();
    expect($modalInstance.close).toHaveBeenCalled();
  });

  it('validation should be active', function () {
    var val = null;
    val = controller.validation();
    expect(val).not.toBeNull();
  });

  it('addService should be active', function () {
    controller.addService();
    expect(controller.validation).toHaveBeenCalled();
    //expect(statusService.addService).toHaveBeenCalled();
  });
});
