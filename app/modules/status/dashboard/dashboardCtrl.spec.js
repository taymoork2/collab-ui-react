'use strict';

describe('controller:DashboardCtrl', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var DcomponentService;
  var $q;
  var $state;
  var component = { "componentId": 463, "serviceId": 141, "componentName": "Chat", "status": "operational", "description": "" };
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _DcomponentService_, _$q_, _$state_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    DcomponentService = _DcomponentService_;
    $q = _$q_;
    $state = _$state_;
    $scope.statuses = [{ label: 'Operational', value: 'operational' }, { label: 'Degraded Performance', value: 'degraded_performance' }, { label: 'Partial Outage', value: 'partial_outage' }, { label: 'Major Outage', value: 'major_outage' }, { label: 'Under Maintenance', value: 'under_maintenance' }];

    spyOn(DcomponentService, 'modifyComponent').and.returnValue(
      $q.when({})
    );
    controller = $controller('DashboardCtrl', {
      $scope: $scope,
      statusService: statusService,
      DcomponentService: DcomponentService
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
  it('modifyComponentStatus should be active', function () {
    //controller.validation = true;
    controller.modifyComponentStatus(component);
    expect(DcomponentService.modifyComponent).toHaveBeenCalled();
  });
  it('toCreatePage should be active', function () {
    spyOn($state, 'go');
    $scope.toCreatePage();
    expect($state.go).toHaveBeenCalled();
  });
  it('getComponents should be OK', function () {
    DcomponentService
      .getComponents(141).then(function (components) {
        expect(controller.components.toString()).toEqual(components.toString());
        for (var i = 0; i < (controller.components).length; i++) {
          switch ((controller.components)[i].status) {
            case 'operational':
              expect((controller.components)[i].statusObj.toString()).toEqual(($scope.statuses)[0].toString());
              break;
            case 'degraded_performance':
              expect((controller.components)[i].statusObj.toString()).toEqual(($scope.statuses)[1].toString());
              break;
            case 'partial_outage':
              expect((controller.components)[i].statusObj.toString()).toEqual(($scope.statuses)[2].toString());
              break;
            case 'major_outage':
              expect((controller.components)[i].statusObj.toString()).toEqual(($scope.statuses)[3].toString());
              break;
            case 'under_maintenance':
              expect((controller.components)[i].statusObj.toString()).toEqual(($scope.statuses)[4].toString());
              break;
          }
          for (var j = 0; j < ((controller.components)[i].components).length; j++) {
            switch (((controller.components)[i].components)[j].status) {
              case 'operational':
                expect(((controller.components)[i].components)[j].statusObj.toString()).toEqual(($scope.statuses)[0].toString());
                break;
              case 'degraded_performance':
                expect(((controller.components)[i].components)[j].statusObj.toString()).toEqual(($scope.statuses)[1].toString());
                break;
              case 'partial_outage':
                expect(((controller.components)[i].components)[j].statusObj.toString()).toEqual(($scope.statuses)[2].toString());
                break;
              case 'major_outage':
                expect(((controller.components)[i].components)[j].statusObj.toString()).toEqual(($scope.statuses)[3].toString());
                break;
              case 'under_maintenance':
                expect(((controller.components)[i].components)[j].statusObj.toString()).toEqual(($scope.statuses)[4].toString());
                break;
            }
          }
        }
      });
  });
});
