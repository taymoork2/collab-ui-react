/**
 * Created by pso on 16-8-25.
 */
'use strict';

describe('controller:IncidentListController', function () {
  var controller;
  var IncidentsWithoutSiteService;
  var UpdateIncidentService;
  var $controller;
  var $scope;
  var ComponentService;
  var statusService;
  var $q;
  var $stateParams;
  var $state;
  var $window;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$controller_, _IncidentsWithoutSiteService_, _UpdateIncidentService_, _ComponentService_, _statusService_, _$q_, _$stateParams_, _$state_, _$window_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    IncidentsWithoutSiteService = _IncidentsWithoutSiteService_;
    UpdateIncidentService = _UpdateIncidentService_;
    ComponentService = _ComponentService_;
    statusService = _statusService_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    $state = _$state_;
    $window = _$window_;
    $stateParams.incident = {
      incidentId: '267'
    };
    $scope.incidentWithMsg = {
      incidentId: '267'
    };
    $scope.componentsTree = {
      incidentId: '267'
    };

    spyOn(statusService, 'getServiceId').and.returnValue($q.when({}));
    //spyOn(IncidentsWithoutSiteService, 'getIncidentMsg').and.returnValue(
    //  { "incidentId": 267, "incidentName": "TEST", "serviceId": 1, "status": "resolved", "impact": "none", "email": "chaoluo@cisco.com", "lastModifiedTime": "2016-09-08T02:07:30Z" }
    //);
    controller = $controller('UpdateIncidentController', {
      $scope: $scope,
      IncidentsWithoutSiteService: IncidentsWithoutSiteService,
      UpdateIncidentService: UpdateIncidentService,
      statusService: statusService,
      ComponentService: ComponentService,
      $stateParams: $stateParams,
      $state: $state,
      $window: $window
    });
   // spyOn(controller, 'getComponentStatusObj').and.returnValue($q.when({}));
  }

  it("dropDown list should be shown correctly", function () {
    expect((controller.getComponentStatusObj("operational"))).toEqual({ label: 'Operational', value: 'operational' });
    expect((controller.getComponentStatusObj("degraded_performance"))).toEqual({ label: 'Degraded Performance', value: 'degraded_performance' });
    expect((controller.getComponentStatusObj("partial_outage"))).toEqual({ label: 'Partial Outage', value: 'partial_outage' });
    expect((controller.getComponentStatusObj("major_outage"))).toEqual({ label: 'Major Outage', value: 'major_outage' });
    expect((controller.getComponentStatusObj("under_maintenance"))).toEqual({ label: 'Under Maintenance', value: 'under_maintenance' });

  });
  it("impacted status should be shown correctly", function () {
    expect((controller.getImpactStatusObj("none"))).toEqual({ label: 'Override impact to None', value: 'none' });
    expect((controller.getImpactStatusObj("minor"))).toEqual({ label: 'Override impact to Minor', value: 'minor' });
    expect((controller.getImpactStatusObj("major"))).toEqual({ label: 'Override impact to Major', value: 'major' });
    expect((controller.getImpactStatusObj("critical"))).toEqual({ label: 'Override impact to Critical', value: 'critical' });
    expect((controller.getImpactStatusObj("maintenance"))).toEqual({ label: 'Override impact to Maintenance', value: 'maintenance' });

  });

  it("ComponentService should be called", function () {
    controller.getComponentsTree();
    expect(statusService.getServiceId).toHaveBeenCalled();
  });

  it("function in scope should be defined", function () {
    expect($scope.showComponentFUN).toBeDefined();
    expect($scope.setSelectedStatus).toBeDefined();
    expect(controller.modifyIncident).toBeDefined();
    expect($scope.getChildStatus).toBeDefined();
    expect($scope.getOverriddenComponent).toBeDefined();
    expect(controller.addIncidentMsg).toBeDefined();
  });
  it('incidentMsg should be active', function () {
    spyOn(controller, 'getImpactStatusObj').and.returnValue({ label: 'Override impact to None', value: 'none' });
    controller.incidentMsg();
    expect($scope.originIncidentName).not.toBeEmpty();
  });
  it('cancleModifyIncident should be active', function () {
    controller.cancleModifyIncident();
    expect($scope.showIncidentName).toBe(true);
  });
  it('toOperationalFUN should be active', function () {
    spyOn($scope, 'showOperational');
    controller.toOperationalFUN();
    expect($scope.showOperational).toBe(false);
  });
});
