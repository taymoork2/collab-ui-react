/**
 * Created by pso on 16-8-22.
 */
'use strict';

describe('controller:DeleteIncidentController',function(){
  var controller;
  var IncidentsWithoutSiteService;
  var $controller;
  var $scope;
  var $q;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  //beforeEach(inject(initController));

  function dependencies(_$rootScope_, _$controller_,_IncidentsWithoutSiteService_) {
    $scope=_$rootScope_.$new();
    $controller=_$controller_;
    //$q=_$q_;
    IncidentsWithoutSiteService=_IncidentsWithoutSiteService_;

    controller=$controller('DeleteIncidentController',{
      $scope: $scope,
      // IncidentsWithSiteService: IncidentsWithSiteService,

    });
    //$scope.$apply();
  }

  it('incidentName should be defined',function(){
    expect($scope.incidentName).not.toEqual(null);
  });

  it('controller should be defined',function(){
    expect($controller).toBeDefined();
  });



  it('delete button should be active',function(){
    expect($scope.deleteIncidentBtn).toBeDefined();
  })
});


