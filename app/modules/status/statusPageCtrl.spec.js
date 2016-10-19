'use strict';

describe('controller:statusPageCtrl', function () {
  var controller;
  var $controller;
  var $scope;
  var statusService;
  var $state;
  var $modal;
  var modalDefer;
  var $q;
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _$state_, _$modal_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    $modal = _$modal_;
    $state = _$state_;
    $q = _$q_;
    controller = $controller('statusPageCtrl', {
      $scope: $scope,
      statusService: statusService,
    });
    controller.service = statusService;
    spyOn($state, 'go');
    modalDefer = $q.defer();
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(statusService, 'getServices').and.callThrough();
  }

  it('defined value should be valid', function () {
    expect(controller.pageTitle).not.toBeEmpty();
    expect(controller.headerTabs).not.toBeEmpty();
  });

  it('getService should be success', function () {
    statusService.getServices().then(function (services) {
      expect(services).not.toBeNull();
      expect(controller.selected).not.toBeNull();
      expect($state.go).toHaveBeenCalled();
    });
  });

  it('addService should be success', function () {
    controller.addService();
    expect($modal.open).toHaveBeenCalled();
  });
});
