/**
 * Created by pso on 16-8-22.
 */

'use strict';

describe('controller:DeleteIncidentController', function () {
  var $controller;
  var $scope;
  var statusService;
  var controller;
  var IncidentsWithoutSiteService;
  var $state;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _IncidentsWithoutSiteService_, _$state_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    IncidentsWithoutSiteService = _IncidentsWithoutSiteService_;
    $state = _$state_;
    spyOn($state, 'go');
    controller = $controller('DeleteIncidentController', {
      $scope: $scope,
      statusService: statusService,
      IncidentsWithoutSiteService: IncidentsWithoutSiteService
    });
  }

  it('incidentName should be defined', function () {
    expect($scope.incidentName).not.toEqual(null);
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('delete button should be active', function () {
    //$scope.deleteCommand = 'DELETE';
    controller.deleteIncidentBtn();
    expect($scope.deleteCommand).toBe("");
  });
});
