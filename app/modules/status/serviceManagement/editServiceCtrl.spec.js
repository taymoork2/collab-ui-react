/**
 * Created by snzheng on 16/10/13.
 */
'use strict';

describe('edit service', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var $modalInstance;
  var serviceObj;
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("serviceObj", serviceObj);
  }));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    //serviceObj = _serviceObj_;
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    controller = $controller('EditServiceCtrl', {
      $scope: $scope,
      statusService: statusService,
      $modalInstance: $modalInstance,
      serviceObj: serviceObj
    });

    spyOn(controller, 'validation').and.returnValue(true);
    //controller.service = serviceObj;
  }
  it('validation should be active', function () {
    var validationResult = controller.validation();
    expect(validationResult).toBe(true);
  });

  it('servive should can be edited', function () {
    controller.editService();
    //expect(controller.validation).toHaveBeenCalled();
    expect(statusService.modifyService).toHaveBeenCalled();
  });

  it('close addModal should be active', function () {
    controller.closeAddModal();
    expect($modalInstance.close).toHaveBeenCalled();
  });
});
