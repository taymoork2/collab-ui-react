/**
 * Created by pso on 16-8-22.
 */
'use strict';

describe('controller:IncidentListController',function(){
  var controller;
  var IncidentsWithSiteService;
  var $controller;
  var $scope;

  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));


  function dependencies(_$rootScope_, _$controller_,_IncidentsWithSiteService_) {
    $scope=_$rootScope_.$new();
    $controller=_$controller_;

   IncidentsWithSiteService=_IncidentsWithSiteService_;

    controller=$controller('IncidentListController',{
      $scope: $scope,
      IncidentsWithSiteService: IncidentsWithSiteService,

    });
    //$scope.$apply();
  }

  it('showList should not be null',function(){
    expect($scope.showList).not.toEqual(null);
  });

  it('controller should be defined',function(){
    expect(controller).toBeDefined();

  });
  it('service should return valid data',function(){
    if($scope.showList==true)
    expect($scope.incidentList).not.toBeEmpty();
    else
      expect($scope.incidentList).toBeEmpty();
  })

  it('button should be active',function(){
    expect($scope.toCreatePage).toBeDefined();
  })
});


