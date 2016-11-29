'use strict';

describe('controller: UpdateIncidentCtrl', function () {
  var $controller, $q, $scope, $state, $stateParams, controller, GSSService, IncidentsService;
  var testData = {
    empty: '',
    actionType: 'update',
    incidentStatusResolved: 'resolved',
    noneStatus: {
      label: 'testLabel',
      value: 'none'
    },
    incidentForUpdate: {
      incidentId: 'testIncidentId',
      incidentName: 'testIncidentName',
      impact: 'none',
      message: 'testMessage',
      status: 'investigating',
    },
    majorOutageStatus: {
      label: 'gss.componentStatus.majorOutage',
      value: 'major_outage'
    },
    components: [{
      componentId: 'testComponentId',
      status: 'operational',
      components: [{
        componentId: 'testComponentId',
        status: 'operational',
        statusObj: {
          label: 'gss.componentStatus.operational',
          value: 'operational'
        }
      }, {
        componentId: 'testComponentId',
        status: 'operational',
        statusObj: {
          label: 'gss.componentStatus.majorOutage',
          value: 'major_outage'
        }
      }]
    }],
    groupComponent: {
      isOverridden: false
    },
    message: {
      isEditingMessage: false,
      message: 'testMessage',
      messageId: 'testMessageId'
    }
  };

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _$stateParams_, _GSSService_, _IncidentsService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;

    $stateParams = _$stateParams_;
    $stateParams.incident = testData.incidentForUpdate;
    $stateParams.actionType = testData.actionType;

    GSSService = _GSSService_;
    IncidentsService = _IncidentsService_;
  }

  function initSpies() {
    spyOn(IncidentsService, 'getIncident').and.returnValue($q.when(200, testData.incidentForUpdate));
    spyOn(IncidentsService, 'getComponents').and.returnValue($q.when(200, testData.components));
    spyOn(IncidentsService, 'updateIncidentNameAndImpact').and.returnValue($q.when());
    spyOn(IncidentsService, 'updateIncident').and.returnValue($q.when());
    spyOn(IncidentsService, 'updateIncidentMessage').and.returnValue($q.when());
    spyOn(IncidentsService, 'getAffectedComponents').and.returnValue($q.when());
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('UpdateIncidentCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      GSSService: GSSService,
      IncidentsService: IncidentsService
    });

    $scope.$apply();
  }

  it('showEditTitle, isEditingTitle should be true', function () {
    controller.showEditTitle();
    expect(controller.isEditingTitle).toBeTruthy();
  });


  it('cancelEditTitle, isEditingTitle should be false', function () {
    controller.cancelEditTitle();
    expect(controller.isEditingTitle).toBeFalsy();
  });

  it('isValidForTitle true, with incident name', function () {
    controller.incidentNameForEdit = testData.incidentForUpdate.incidentName;
    expect(controller.isValidForTitle()).toBeTruthy();
  });

  it('isValidForTitle false, without incident name', function () {
    controller.incidentNameForEdit = testData.empty;
    expect(controller.isValidForTitle()).toBeFalsy();
  });

  it('saveTitle isValidForTitle true, should call updateIncidentNameAndImpact service', function () {
    controller.incidentNameForEdit = testData.incidentForUpdate.incidentName;
    controller.impactStatusForEdit = testData.noneStatus;

    controller.saveTitle();
    expect(IncidentsService.updateIncidentNameAndImpact).toHaveBeenCalled();
  });

  it('saveTitle isValidForTitle false, should not call updateIncidentNameAndImpact service', function () {
    controller.incidentNameForEdit = testData.empty;
    controller.saveTitle();

    expect(IncidentsService.updateIncidentNameAndImpact).not.toHaveBeenCalled();
  });

  it('setOperationalForComponents, isShowSetComponentTips should be true', function () {
    controller.setOperationalForComponents();
    expect(controller.isShowSetComponentTips).toBeTruthy();
  });

  it('toggleOverridden, should be toggled', function () {
    controller.toggleOverridden(testData.groupComponent);
    expect(testData.groupComponent.isOverridden).toBeTruthy();
  });

  it('isIncidentStatusResolved true, with status resolved', function () {
    controller.incidentForUpdate = {
      status: testData.incidentStatusResolved
    };

    expect(controller.isIncidentStatusResolved()).toBeTruthy();
  });

  it('isIncidentStatusResolved false, without status resolved', function () {
    expect(controller.isIncidentStatusResolved()).toBeFalsy();
  });

  it('isValidForIncident true, with incident message', function () {
    controller.incidentForUpdate = {
      message: testData.incidentForUpdate.message
    };

    expect(controller.isValidForIncident()).toBeTruthy();
  });

  it('isValidForIncident false, without incident message', function () {
    controller.incidentForUpdate = {
      message: testData.empty
    };

    expect(controller.isValidForIncident()).toBeFalsy();
  });

  it('updateIncident isValidForIncident true, should call updateIncident service', function () {
    controller.incidentForUpdate = {
      incidentId: testData.incidentForUpdate.incidentId,
      message: testData.incidentForUpdate.message,
      status: testData.incidentForUpdate.status
    };

    controller.updateIncident();
    expect(IncidentsService.updateIncident).toHaveBeenCalled();
  });

  it('updateIncident isValidForIncident false, should not call updateIncident service', function () {
    controller.incidentForUpdate = {
      message: testData.empty
    };

    controller.updateIncident();
    expect(IncidentsService.updateIncident).not.toHaveBeenCalled();
  });

  it('overrideGroupComponent, should set the most significant status to group component', function () {
    var groupComponent = testData.components[0];
    groupComponent.isOverridden = true;

    controller.overrideGroupComponent(groupComponent);
    expect(groupComponent.statusObj).toEqual(testData.majorOutageStatus);
  });

  it('initMessageData, field should be initialized', function () {
    controller.initMessageData(testData.message);

    expect(testData.message.isEditingMessage).toBeFalsy();
    expect(testData.message.editMessage).toEqual(testData.message.message);
  });

  it('showEditMessage, isEditingMessage should be true', function () {
    controller.showEditMessage(testData.message);
    expect(testData.message.isEditingMessage).toBeTruthy();
  });

  it('isValidForMessage true, with message', function () {
    testData.message.editMessage = testData.message.message;
    expect(controller.isValidForMessage(testData.message)).toBeTruthy();
  });

  it('isValidForMessage false, without message', function () {
    expect(controller.isValidForIncident(testData.message)).toBeFalsy();
  });

  it('saveMessage isValidForMessage true, should call updateIncidentMessage service', function () {
    testData.message.editMessage = testData.message.message;

    controller.saveMessage(testData.message);
    expect(IncidentsService.updateIncidentMessage).toHaveBeenCalled();
  });

  it('saveMessage isValidForMessage false, should not call updateIncidentMessage service', function () {
    testData.message.editMessage = testData.empty;

    controller.saveMessage(testData.message);
    expect(IncidentsService.updateIncidentMessage).not.toHaveBeenCalled();
  });

  it('showAffectedComponents, should call getAffectedComponents service', function () {
    controller.showAffectedComponents(testData.message);
    expect(IncidentsService.getAffectedComponents).toHaveBeenCalled();
  });

  it('hideAffectedComponent, isShowAffectedComponents to be false', function () {
    controller.hideAffectedComponent(testData.message);
    expect(testData.message.isShowAffectedComponents).toBeFalsy();
  });
});
