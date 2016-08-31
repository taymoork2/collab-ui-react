/**
 * Created by pso on 16-8-22.
 */
'use strict';

describe('controller:CreateIncidentController', function () {
  var $controller;
  var $scope;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  //beforeEach(inject(initController));

  function dependencies(_$rootScope_, _$controller_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
  }

  it('newIncident should be defined', function () {
    expect($scope.newIncident).not.toEqual(null);
  });

  it('controller should be defined', function () {
    expect($controller).toBeDefined();
  });


  it('create button should be active',function () {
    expect($scope.CreateIncident).toBeDefined();
  });
});
