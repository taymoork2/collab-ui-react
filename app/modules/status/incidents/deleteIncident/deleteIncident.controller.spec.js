/**
 * Created by pso on 16-8-22.
 */
'use strict';

describe('controller:DeleteIncidentController', function () {
  var $controller;
  var $scope;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$controller_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
  }

  it('incidentName should be defined', function () {
    expect($scope.incidentName).not.toEqual(null);
  });

  it('controller should be defined', function () {
    expect($controller).toBeDefined();
  });

  it('delete button should be active', function () {
    expect($scope.deleteIncidentBtn).toBeDefined();
  });
});
