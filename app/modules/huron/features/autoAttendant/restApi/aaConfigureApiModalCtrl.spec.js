'use strict';

describe('Controller: AAConfigureApiModalCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var AASessionVariableService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');

  var $rootScope, $scope;

  var aaUiModel = {
    openHours: {},
  };

  var schedule = 'openHours';
  var index = '0';
  var menu;
  var q;
  var c;
  var action;
  var $translate;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
  };
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AASessionVariableService_, _AutoAttendantCeMenuModelService_, _$translate_) {

    $rootScope = _$rootScope_;
    $scope = $rootScope;
    q = $q;

    schedule = 'openHours';
    index = '0';

    aaUiModel = {
      openHours: {},
    };

    controller = $controller;

    AASessionVariableService = _AASessionVariableService_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    $translate = _$translate_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

    menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

    aaUiModel['openHours'].addEntryAt(index, menu);
    action = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
    action.url = 'test URL';
    action.variableSet = [{
      value: '1',
      variableName: 'Test1',
    }];
    action.method = 'GET';
    aaUiModel[schedule].entries[0].addAction(action);
    $scope.schedule = schedule;
    $scope.index = index;

    spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(customVarJson));
    spyOn($translate, 'instant');
    $translate.instant.and.returnValue('New Variable');

    c = controller('AAConfigureApiModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      aa_schedule: schedule,
      aa_index: index,
    });
  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    AASessionVariableService = null;
    controller = null;
    aaUiModel = null;
    menu = null;
  });

  describe('activate', function () {
    it('should be defined', function () {
      $scope.$apply();
      expect(c).toBeDefined();
    });
  });

  describe('canShowWarn', function () {
    it('should set isWarn false whenever nameInput is valid', function () {
      $scope.$apply();
      var test = {
        value: '',
        variableName: 'New Variable',
        newVariableValue: 'test1',
        isWarn: true,
      };
      c.canShowWarn(test);
      expect(test.isWarn).toEqual(false);
    });

    it('should set warn to true because of duplicate variable name in session object', function () {
      $scope.$apply();
      var test = {
        value: '',
        variableName: 'New Variable',
        newVariableValue: 'Test1',
        isWarn: false,
      };
      c.variableSet = [{
        value: '',
        newVariableValue: 'Test1',
        variableName: 'New Variable',
        isWarn: false,
      }, {
        value: '',
        variableName: 'Test1',
        isWarn: false,
      }];
      c.canShowWarn(test);
      expect(test.isWarn).toEqual(true);
    });

    it('isWarn should be false', function () {
      $scope.$apply();
      var test = {
        value: '',
        newVariableValue: '',
        isWarn: false,
      };
      c.canShowWarn(test);
      expect(test.isWarn).toEqual(false);
    });
  });

  describe('addVariableSet', function () {
    it('should push variableSet in existing set', function () {
      $scope.$apply();
      expect(c.variableSet.length).toEqual(1);
      c.addVariableSet();
      expect(c.variableSet.length).toEqual(2);
    });
  });

  describe('isSaveDisabled', function () {
    it('should disable save whenever any field is empty', function () {
      $scope.$apply();
      c.url = '';
      expect(c.isSaveDisabled()).toEqual(true);
      c.url = 'test URL';
      expect(c.isSaveDisabled()).toEqual(false);
    });
  });

  describe('deleteVariableSet', function () {
    it('should delete variableSet for given index', function () {
      $scope.$apply();
      expect(c.variableSet.length).toEqual(1);
      c.deleteVariableSet(0);
      expect(c.variableSet.length).toEqual(0);
    });
  });

  describe('save', function () {
    it('save function call results in closing the Modal.', function () {
      $scope.$apply();
      c.save();
      expect(modalFake.close).toHaveBeenCalled();
    });
  });

});
