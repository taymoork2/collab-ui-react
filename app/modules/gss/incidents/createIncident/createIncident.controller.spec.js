'use strict';

describe('controller: CreateIncidentCtrl', function () {
  var $controller, $q, $scope, $state, controller, GSSService, IncidentsService;
  var testData = {
    incident: {
      name: 'testIncidentName',
      status: 'testIncidentStatus',
      message: 'testIncidentMessage',
      email: 'testEmail'
    }
  };

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
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

  function initSpies() {
    spyOn(IncidentsService, 'createIncident').and.returnValue($q.when());
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('CreateIncidentCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      IncidentsService: IncidentsService
    });

    $scope.$apply();
  }

  it('createIncident isValid true, should call createIncident service', function () {
    controller.incidentName = testData.incident.name;
    controller.message = testData.incident.message;

    controller.createIncident();
    expect(IncidentsService.createIncident).toHaveBeenCalled();
  });

  it('createIncident isValid false, should not call createIncident service', function () {
    controller.createIncident();
    expect(IncidentsService.createIncident).not.toHaveBeenCalled();
  });

  it('isValid true, with incident name and message', function () {
    controller.incidentName = testData.incident.name;
    controller.message = testData.incident.message;

    expect(controller.isValid()).toBeTruthy();
  });

  it('isValid false, without incident name and message', function () {
    expect(controller.isValid()).toBeFalsy();
  });

  it('goBack, should go back', function () {
    controller.goBack();
    expect($state.go).toHaveBeenCalledWith('^');
  });
});
