'use strict';

describe('service manage controller', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var $modal;
  var $q;
  var modalDefer;
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _$modal_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    $modal = _$modal_;
    $q = _$q_;
    controller = $controller('ServiceManagementCtrl', {
      $scope: $scope,
      statusService: statusService,
    });

   // spyOn(statusService, 'getServiceId').and.returnValue($q.when({}));
    modalDefer = $q.defer();
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
  }
  it('editervice should call $modal', function () {
    controller.editServiceModal();
    expect(controller.services).not.toBeNull();
    expect($modal.open).toHaveBeenCalledWith({
      type: 'small',
      controller: 'EditServiceCtrl',
      controllerAs: 'esc',
      templateUrl: 'modules/status/serviceManagement/editService.tpl.html',
      modalClass: 'status-edit-service',
      resolve: {
        serviceObj: jasmine.any(Function)
      }
    });
  });

  it('deleteService should call $modal', function () {
    controller.deleteServiceModal();
   // expect(statusService.getServiceId).toHaveBeenCalled();
    expect($modal.open).toHaveBeenCalledWith({
      type: 'small',
      controller: 'DeleteServiceCtrl',
      controllerAs: 'dsc',
      templateUrl: 'modules/status/serviceManagement/deleteService.tpl.html',
      modalClass: 'status-delete-service',
      resolve: {
        serviceObj: jasmine.any(Function)
      }
    });
    //expect(statusService.getServices).toHaveBeenCalled();
  });
});
