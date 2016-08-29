/**
 * Created by pso on 16-8-25.
 */
'use strict';

describe('controller:IncidentListController',function(){
  var controller;
  var IncidentsWithoutSiteService;
  var UpdateIncidentService
  var $controller;
  var $scope;
  var $q;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  //beforeEach(inject(initController));

  function dependencies(_$rootScope_, _$controller_,_IncidentsWithoutSiteService_,_UpdateIncidentService_) {
    $scope=_$rootScope_.$new();
    $controller=_$controller_;
    //$q=_$q_;
    IncidentsWithoutSiteService=_IncidentsWithoutSiteService_;
    UpdateIncidentService=_UpdateIncidentService_;
    controller=$controller('UpdateIncidentController',{
      $scope: $scope,
      // IncidentsWithoutSiteService: IncidentsWithoutSiteService,

    });
    //$scope.$apply();
  }

  it('IncidentMsg should be called',function(){
    //$scope.addIncidentMsg();

    //expect(IncidentsWithoutSiteService.getIncidentMsg).toHaveBeenCalled();
    expect($scope.incidentName).not.toBeEmpty();
    expect($scope.status).not.toBeEmpty();
    expect($scope.msg).not.toBeEmpty();
    expect($scope.messages).not.toBeEmpty();
  });

  it('showComponentFUN should have been defined',function(){
    expect($scope.showComponentFUN).toBeDefined();
    expect($scope.showComponent).not.toBeEmpty();
  })

});
