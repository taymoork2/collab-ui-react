'use strict';

describe('Controller: AABuilderMainCtrl', function () {
  var controller, Notification, AutoAttendantCeService;
  var AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAValidationService, AANumberAssignmentService;
  var $rootScope, $scope, $q, $translate, $stateParams, $compile;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var a3LaneCe = getJSONFixture('huron/json/autoAttendant/a3LaneCe.json');
  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  var aaModel = {};

  var aaUiModel = {
    openHours: {}
  };

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$q_, $injector, _$compile_, _$stateParams_, $controller, _$translate_, _Notification_,
    _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _AAModelService_, _AANumberAssignmentService_, _AutoAttendantCeService_, _AAValidationService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $scope.$dismiss = function () {
      return true;
    };
    $translate = _$translate_;
    $stateParams = _$stateParams_;
    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAValidationService = _AAValidationService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AANumberAssignmentService = _AANumberAssignmentService_;
    Notification = _Notification_;

    // aaModel.dataReadyPromise = $q(function () {});
    $stateParams.aaName = '';

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUiModelService, 'initUiModel');
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue($q.when($stateParams.aaName));

    controller = $controller('AABuilderMainCtrl as vm', {
      $scope: $scope,
      $stateParams: $stateParams,
      Notification: Notification,
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('areAssignedResourcesDifferent', function () {
    it('should show no differences', function () {
      var a1 = [{
        id: "408792221"
      }, {
        id: "4087963542"
      }, {
        id: "40872655"
      }];
      var a2 = [{
        id: "408792221"
      }, {
        id: "4087963542"
      }, {
        id: "40872655"
      }];

      var ret = controller.areAssignedResourcesDifferent(a1, a2, "id");

      $scope.$apply();

      expect(ret).toBe(false);

    });

    it('should show a difference', function () {
      var a1 = [{
        id: "40892221"
      }, {
        id: "4087963542"
      }, {
        id: "40872655"
      }];
      var a2 = [{
        id: "408792221"
      }, {
        id: "4087963542"
      }, {
        id: "40872655"
      }];

      var ret = controller.areAssignedResourcesDifferent(a1, a2, "id");

      $scope.$apply();

      expect(ret).toBe(true);

    });
  });

  describe('saveAANumberAssignmentWithErrorDetail', function () {
    it('should show error message when assigning number', function () {
      spyOn(Notification, 'error');
      spyOn(AANumberAssignmentService, 'setAANumberAssignmentWithErrorDetail').and.returnValue($q.reject());

      controller.saveAANumberAssignmentWithErrorDetail();
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.errorFailedToAssignNumbers', jasmine.any(Object));

    });
  });

  describe('saveAARecords', function () {

    var createCeSpy;
    var updateCeSpy;
    var nameValidationSpy;

    beforeEach(function () {
      createCeSpy = spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      updateCeSpy = spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn($scope.vm, 'saveUiModel');
      spyOn(AANumberAssignmentService, 'setAANumberAssignment').and.returnValue($q.when());

      nameValidationSpy = spyOn(AAValidationService, 'isNameValidationSuccess').and.returnValue(true);
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;
    });

    it('should save a new aaRecord successfully', function () {
      aaModel.aaRecordUUID = "";
      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successCreateCe', jasmine.any(Object));
    });

    it('should report failure if AutoAttendantCeService.createCe() failed', function () {
      aaModel.aaRecordUUID = "";
      createCeSpy.and.returnValue($q.reject({
        statusText: "server error",
        status: 500
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.errorCreateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

    it('should report failure if AutoAttendantCeService.updateCe() failed', function () {
      aaModel.aaRecords.push(rawCeInfo);
      aaModel.aaRecordUUID = 'c16a6027-caef-4429-b3af-9d61ddc7964b';
      updateCeSpy.and.returnValue($q.reject({
        statusText: "server error",
        status: 500
      }));
      controller.saveAARecords();
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.errorUpdateCe', jasmine.any(Object));
    });

    it('should not save when there is a name validation error', function () {
      nameValidationSpy.and.returnValue(false);

      controller.saveAARecords();

      expect($scope.vm.saveUiModel).not.toHaveBeenCalled();
    });
  });

  describe('selectAA', function () {

    var readCe;

    beforeEach(function () {
      readCe = spyOn(AutoAttendantCeService, 'readCe').and.returnValue($q.when(angular.copy(aCe)));
      spyOn($scope.vm, 'populateUiModel');
      spyOn(Notification, 'error');
      spyOn(AAModelService, 'getNewAARecord').and.callThrough();

    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined', function () {
      $scope.vm.aaModel = {};
      controller.selectAA('');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
    });
    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is empty', function () {
      $scope.vm.aaModel = {};
      $scope.vm.templateName = "";
      controller.selectAA('');
      $scope.$apply();
      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined and a template name is set', function () {
      $scope.vm.aaModel = {};

      controller.selectAA('');
      $scope.$apply();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(false);
      expect($scope.vm.ui.isHolidays).toEqual(false);
      expect(AAModelService.getNewAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
    });

    it('should be able to read an existing new aaRecord successfully when no name is given', function () {
      // when aaModel.aaRecord is defined
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      controller.selectAA('');
      $scope.$apply();

      // $scope.vm.aaModel should not be initialized again with a new AARecord
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();

      expect($scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a name is given', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();

      expect($scope.vm.aaModel.aaRecord.callExperienceName).toEqual(aCe.callExperienceName);
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should return error when the backend return 500 error', function () {
      readCe.and.returnValue(
        $q.reject({
          status: 500
        })
      );
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalled();
      expect(AAModelService.getNewAARecord).not.toHaveBeenCalled();
      expect($scope.vm.populateUiModel).not.toHaveBeenCalled();
    });
  });

  describe('setupTemplate', function () {

    beforeEach(function () {
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');

    });

    it('should set up a say say open hours template using real template1', function () {

      $scope.vm.templateName = 'template1';
      controller.setupTemplate();

      expect($scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('say');
      expect($scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('runActionsOnInput');
      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(false);
      expect($scope.vm.ui.isHolidays).toEqual(false);

    });

    it('should set up a say say say open hours template using test template', function () {
      $scope.vm.templateDefinitions = [{
        tname: "template2",
        actions: [{
          lane: "openHours",
          actionset: ["play3", "play4", "play5"]
        }]
      }];
      $scope.vm.templateName = 'template2';
      controller.setupTemplate();
      expect($scope.vm.ui.openHours['entries'].length).toEqual(3);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('play3');
      expect($scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('play4');
      expect($scope.vm.ui.openHours['entries'][2]['actions'][0]['name']).toEqual('play5');
      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(false);
      expect($scope.vm.ui.isHolidays).toEqual(false);
    });

    it('should set up a say say open hours - say closed hours template', function () {
      $scope.vm.templateDefinitions = [{
        tname: "template3",
        actions: [{
          lane: 'openHours',
          actionset: ["playOpen1", "playOpen2"]
        }, {
          lane: 'closedHours',
          actionset: ["playClosed1"]
        }]
      }];
      $scope.vm.templateName = 'template3';
      controller.setupTemplate();

      expect($scope.vm.ui.openHours['entries'].length).toEqual(2);
      expect($scope.vm.ui.openHours['entries'][0]['actions'][0]['name']).toEqual('playOpen1');
      expect($scope.vm.ui.openHours['entries'][1]['actions'][0]['name']).toEqual('playOpen2');
      expect($scope.vm.ui.closedHours['entries'].length).toEqual(1);
      expect($scope.vm.ui.closedHours['entries'][0]['actions'][0]['name']).toEqual('playClosed1');
      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(false);
    });

    it('should fail to create template since template name is not valid', function () {

      $scope.vm.templateName = 'templateDoesNotExist';
      controller.setupTemplate();

      expect(Notification.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplate', jasmine.any(Object)
      );

    });

    it('should fail to create template since template has no actions', function () {

      $scope.vm.templateDefinitions = [{
        tname: "templateNoActions",
      }];

      $scope.vm.templateName = 'templateNoActions';
      controller.setupTemplate();

      expect(Notification.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplateDef', jasmine.any(Object)
      );

    });

    it('should fail to create template since template has no action set in closedHours lane', function () {

      $scope.vm.templateDefinitions = [{
        tname: "templateMissingActionSet",
        actions: [{
          lane: "openHours",
          actionset: ["playOpen1", "playOpen2"]
        }, {
          lane: "closedHours"
        }]
      }];

      $scope.vm.templateName = 'templateMissingActionSet';
      controller.setupTemplate();

      expect(Notification.error).toHaveBeenCalledWith(
        'autoAttendant.errorInvalidTemplateDef', jasmine.any(Object)
      );

    });

    it('should NOT display add step icons on aa-builder-lane', function () {
      $rootScope.schedule = 'openHours';
      $rootScope.index = 0;
      var element = $compile("<aa-builder-lane aa-schedule='openHours'></aa-builder-lane>")($rootScope);

      $rootScope.$digest();
      expect(element.find('aa-panel').hasClass('ng-show')).toBe(false);
    });

    it('should NOT display add step icons on aa-builder-actions', function () {
      $rootScope.schedule = 'openHours';
      $rootScope.index = 0;
      var element = $compile("<aa-builder-actions></aa-builder-actions>")($rootScope);

      $rootScope.$digest();
      expect(element.find('aa-panel').hasClass('ng-show')).toBe(false);
    });

    // TODO:SIMPLETEMPLATE Should also verify that delete steps are not shown
  });

  describe('populateUiModel', function () {

    it('should initialize new openHours, closedHours and holidays menus successfully if they do not exist', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = aCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(false);
      expect($scope.vm.ui.isHolidays).toEqual(false);
    });

    it('should build openHours, closedHours and holidays menus successfully from model', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = a3LaneCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(true);
    });

  });

  describe('saveUiModel', function () {

    beforeEach(function () {
      spyOn(AutoAttendantCeInfoModelService, 'setCeInfo');
      spyOn(AutoAttendantCeMenuModelService, 'updateCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'deleteCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'newCeMenu').and.callThrough();
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = ce2CeInfo(rawCeInfo);
      $scope.vm.ui.builder = {};
      $scope.vm.ui.builder.ceInfo_name = "AAA2";
    });

    it('should write UI CeInfo into model', function () {
      controller.saveUiModel();

      expect(AutoAttendantCeInfoModelService.setCeInfo).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, $scope.vm.ui.ceInfo);
    });

    it('should write openHours menu into model', function () {
      $scope.vm.ui.isOpenHours = true;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidayss = false;
      $scope.vm.ui.openHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'openHours', $scope.vm.ui.openHours);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours');
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write closedHours menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = true;
      $scope.vm.ui.isHolidays = false;
      $scope.vm.ui.closedHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours', $scope.vm.ui.closedHours);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays');
    });

    it('should write holidays menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidays = true;
      $scope.vm.ui.holidays = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays', $scope.vm.ui.holidays);
      expect(AutoAttendantCeMenuModelService.deleteCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours');
    });

  });

  describe('setAANameFocus', function () {
    it('should set model aaNameFocus variable to true', function () {
      $scope.vm.aaNameFocus = "false";
      controller.setAANameFocus();

      expect($scope.vm.aaNameFocus).toEqual(true);
    });
  });
});
