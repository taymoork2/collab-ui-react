/**
 * Created by pso on 16-8-22.
 */
'use strict';

describe('controller:CreateIncidentController', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    controller = $controller('CreateIncidentController', {
      $scope: $scope,
      statusService: statusService
    });
  }

  it('newIncident should be defined', function () {
    expect($scope.newIncident).not.toEqual(null);
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('create button should be active', function () {
    expect(controller.CreateIncident).toBeDefined();
  });
});
