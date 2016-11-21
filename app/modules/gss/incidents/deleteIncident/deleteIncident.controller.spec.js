'use strict';

describe('controller: DeleteIncidentCtrl', function () {
  var $controller, $q, $scope, $state, controller, IncidentsService;
  var testData = {
    deleteCommand: 'DELETE',
    incidentForDelete: {
      incidentId: 'testIncidentId'
    }
  };

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _IncidentsService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    IncidentsService = _IncidentsService_;
  }

  function initSpies() {
    spyOn(IncidentsService, 'deleteIncident').and.returnValue($q.when());
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('DeleteIncidentCtrl', {
      $scope: $scope,
      IncidentsService: IncidentsService
    });

    $scope.$apply();
  }

  it('deleteIncident isValid true, should call deleteIncident service', function () {
    controller.deleteCommand = testData.deleteCommand;
    controller.incident = testData.incidentForDelete;

    controller.deleteIncident();
    expect(IncidentsService.deleteIncident).toHaveBeenCalled();
  });

  it('deleteIncident isValid false, should not call deleteIncident service', function () {
    controller.deleteIncident();
    expect(IncidentsService.deleteIncident.calls.count()).toEqual(0);
  });

  it('isValid true, with right delete confirm text', function () {
    controller.deleteCommand = testData.deleteCommand;

    expect(controller.isValid()).toBeTruthy();
  });

  it('isValid false, without delete confirm text', function () {
    expect(controller.isValid()).toBeFalsy();
  });

  it('goBack, should go back', function () {
    controller.goBack();
    expect($state.go).toHaveBeenCalledWith('^');
  });
});
