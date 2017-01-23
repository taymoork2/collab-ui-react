'use strict';

describe('controller: DashboardCtrl', function () {
  var $controller, $modal, $q, $scope, $state, controller, DashboardService, GSSService;
  var component;
  var testData = {
    testIncident: {
      incidentId: 'testIncidentId',
      status: 'resolved',
      localizedStatus: 'gss.incidentStatus.resolved'
    },
    actionType: 'update'
  };


  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  beforeEach(inject(dependencies));
  beforeEach(initController);
  beforeEach(initSpies);
  beforeEach(loadTestData);

  function dependencies(_$controller_, _$modal_, _$q_, _$rootScope_, _$state_, _DashboardService_, _GSSService_) {
    $controller = _$controller_;
    $modal = _$modal_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    DashboardService = _DashboardService_;
    GSSService = _GSSService_;
  }

  function destructDI() {
    $controller = $modal = $q = $scope = $state = controller = DashboardService = GSSService = undefined;
  }

  function initController() {
    controller = $controller('DashboardCtrl', {
      $scope: $scope,
      $state: $state,
      DashboardService: DashboardService,
      GSSService: GSSService
    });

    $scope.$apply();
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(DashboardService, 'modifyComponent').and.returnValue($q.resolve());
    spyOn($modal, 'open').and.returnValue({
      result: $q.resolve()
    });
  }

  function loadTestData() {
    var testComponent = {
      componentId: 'testComponentId',
      componentName: 'testComponentName',
      status: 'testStatus',
      statusObj: {
        label: 'statusLabel',
        value: 'statusValue'
      }
    };

    var subComponent = _.clone(testComponent, true);
    subComponent.status = 'partial_outage';
    subComponent.statusObj.value = 'partial_outage';

    component = _.clone(testComponent, true);
    component.isOverridden = false;
    component.status = 'operational';
    component.statusObj.value = 'operational';
    component.components = [subComponent];
  }

  it('call goToNewIncidentPage, should go to new incident page', function () {
    controller.goToNewIncidentPage();
    expect($state.go).toHaveBeenCalledWith('gss.incidents.new');
  });

  it('call goToUpdateIncidentPage, should go to update incident page', function () {
    controller.goToUpdateIncidentPage(testData.testIncident);
    expect($state.go).toHaveBeenCalledWith('gss.incidents.update', {
      incident: testData.testIncident,
      actionType: testData.actionType
    });
  });

  it('addComponent should call $modal', function () {
    controller.addComponent();
    expect($modal.open).toHaveBeenCalled();
  });

  it('toggleOverridden, ', function () {
    controller.toggleOverridden(component);
    expect(component.isOverridden).toBeTruthy();
    expect(DashboardService.modifyComponent).toHaveBeenCalled();
  });

  it('call modifyGroupComponentStatus, DashboardService.modifyComponent should been called', function () {
    controller.modifyGroupComponentStatus(component);
    expect(DashboardService.modifyComponent).toHaveBeenCalled();
  });

  it('call modifySubComponentStatus, DashboardService.modifyComponent should been called', function () {
    controller.modifySubComponentStatus(component, component.components[0]);
    expect(DashboardService.modifyComponent).toHaveBeenCalled();
  });

  it('getLocalizedIncidentStatus', function () {
    expect(controller.getLocalizedIncidentStatus(testData.testIncident.status)).toEqual(testData.testIncident.localizedStatus);
  });
});
