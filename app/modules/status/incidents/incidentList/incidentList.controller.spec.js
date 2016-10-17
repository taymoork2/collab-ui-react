/**
 * Created by pso on 16-8-22.
 */

'use strict';

describe('controller:IncidentListController', function () {
  var controller;
  var IncidentsWithSiteService;
  var $controller;
  var $scope;
  var statusService;
  var $state;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$controller_, _IncidentsWithSiteService_, _statusService_, _$state_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    IncidentsWithSiteService = _IncidentsWithSiteService_;
    $state = _$state_;
    controller = $controller('IncidentListController', {
      $scope: $scope,
      IncidentsWithSiteService: IncidentsWithSiteService,
      statusService: statusService,
    });
  }

  it('showList should not be null', function () {
    expect($scope.showList).not.toEqual(null);
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('service should return valid data', function () {
    if ($scope.showList == true) expect($scope.incidentList).not.toBeEmpty();
    else if ($scope.showList != true) expect($scope.incidentList).toBeEmpty();
  });
  it('button should be active', function () {
    spyOn($state, 'go');
    $scope.toCreatePage();
    expect($state.go).toHaveBeenCalled();
  });
});
