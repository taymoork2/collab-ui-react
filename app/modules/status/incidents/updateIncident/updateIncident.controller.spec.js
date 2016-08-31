/**
 * Created by pso on 16-8-25.
 */
'use strict';

describe('controller:IncidentListController', function () {
  var controller;
  var IncidentsWithoutSiteService;
  var UpdateIncidentService
  var $controller;
  var $scope;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$controller_, _IncidentsWithoutSiteService_, _UpdateIncidentService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    IncidentsWithoutSiteService = _IncidentsWithoutSiteService_;
    UpdateIncidentService = _UpdateIncidentService_;
  }

  it('IncidentMsg should be called', function () {
    expect($scope.incidentName).not.toBeEmpty();
    expect($scope.status).not.toBeEmpty();
    expect($scope.msg).not.toBeEmpty();
    expect($scope.messages).not.toBeEmpty();
  });

  it('showComponentFUN should have been defined', function () {
    expect($scope.showComponentFUN).toBeDefined();
    expect($scope.showComponent).not.toBeEmpty();
  });

});
