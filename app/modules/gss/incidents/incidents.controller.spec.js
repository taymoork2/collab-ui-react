'use strict';

describe('controller: IncidentsCtrl', function () {
  var $controller, $q, $scope, $state, controller, GSSService, IncidentsService;
  var testData = {
    resolved: 'resolved',
    nonResolved: 'non-resolved',
    incidentForDelete: {
      incidentId: 'testIncidentId'
    },
    actionType: 'update',
    incidentForUpdate: {
      incidentId: 'testIncidentId'
    }
  };

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  afterAll(function () {
    testData = undefined;
  });
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _GSSService_, _IncidentsService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    GSSService = _GSSService_;
    IncidentsService = _IncidentsService_;
  }

  function destructDI() {
    $controller = $q = $scope = $state = controller = GSSService = IncidentsService = undefined;
  }

  function initSpies() {
    spyOn(GSSService, 'getServiceId').and.returnValue('testServiceId');
    spyOn(IncidentsService, 'getIncidents').and.returnValue($q.resolve());
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('IncidentsCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      IncidentsService: IncidentsService
    });

    $scope.$apply();
  }

  it('init, should load incidents', function () {
    expect(IncidentsService.getIncidents).toHaveBeenCalled();
  });

  it('isResolved true, with resolved status', function () {
    expect(controller.isResolved(testData.resolved)).toBeTruthy();
  });

  it('isResolved false, with non-resolved status', function () {
    expect(controller.isResolved(testData.nonResolved)).toBeFalsy();
  });

  it('deleteIncident, should go to delete page', function () {
    controller.deleteIncident(testData.incidentForDelete);

    expect($state.go).toHaveBeenCalledWith('gss.incidents.delete', {
      incident: testData.incidentForDelete
    });
  });

  it('updateIncident, should go to update page', function () {
    controller.updateIncident(testData.incidentForUpdate, testData.actionType);

    expect($state.go).toHaveBeenCalledWith('gss.incidents.update', {
      incident: testData.incidentForUpdate,
      actionType: testData.actionType
    });
  });
});
