'use strict';

describe('Controller: AATimeoutInvalidCtrl', function () {
  var $controller;
  var controller;

  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;

    aaUiModel['openHours'].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

    var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
    aaUiModel['openHours'].entries[0].addAction(action);

    controller = $controller('AATimeoutInvalidCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  describe('createOptionMenu', function () {
    it('should initialize CeMenu Timeout/Invalid input with Repeat-Menu-3-Times', function () {
      controller.createOptionMenu();

      var expectedActions = angular.copy(controller.timeoutActions[0]);

      expectedActions.childOptions = angular.copy(controller.repeatOptions);
      expectedActions.selectedChild = angular.copy(controller.repeatOptions[2]);

      expect(angular.equals(expectedActions, controller.selectedTimeout)).toEqual(true);
    });
  });

  describe('populateOptionMenu', function () {

    it('should read the CeMenu with attempts 1 and set UI to Continue-To-Next-Step (Timeout/Invalid)', function () {
      controller.menuEntry.attempts = 1;
      controller.selectedTimeout = [];
      controller.populateOptionMenu();

      var expectedActions = angular.copy(controller.timeoutActions[0]);

      expect(angular.equals(expectedActions, controller.selectedTimeout)).toEqual(true);
    });

    it('should read the CeMenu without attempts and set UI to Repeat-Menu-3-Times (Timeout/Invalid)', function () {
      controller.menuEntry.attempts = undefined;
      controller.selectedTimeout = [];
      controller.populateOptionMenu();

      var expectedActions = angular.copy(controller.timeoutActions[1]);
      expectedActions.childOptions = angular.copy(controller.repeatOptions);
      expectedActions.selectedChild = angular.copy(controller.repeatOptions[2]);

      expect(angular.equals(expectedActions, controller.selectedTimeout)).toEqual(true);
    });

    it('should read the CeMenu with attempts 2 and set UI to Repeat-Menu-Once (Timeout/Invalid)', function () {
      controller.menuEntry.attempts = 2;
      controller.selectedTimeout = [];
      controller.populateOptionMenu();

      var expectedActions = angular.copy(controller.timeoutActions[1]);
      expectedActions.childOptions = angular.copy(controller.repeatOptions);
      expectedActions.selectedChild = angular.copy(controller.repeatOptions[0]);

      expect(angular.equals(expectedActions, controller.selectedTimeout)).toEqual(true);
    });
    it('should read the CeMenu with attempts 6 and set UI to Repeat-Menu-Five (Timeout/Invalid)', function () {
      controller.menuEntry.attempts = 6;
      controller.selectedTimeout = [];
      controller.populateOptionMenu();

      var expectedActions = angular.copy(controller.timeoutActions[1]);
      expectedActions.childOptions = angular.copy(controller.repeatOptions);
      expectedActions.selectedChild = angular.copy(controller.repeatOptions[4]);

      expect(angular.equals(expectedActions, controller.selectedTimeout)).toEqual(true);
    });

  });

  describe('timeoutInvalidChanged', function () {
    it('should write Continue-To-Next-Step (Timeout/Invalid action) to the model', function () {
      // phone menu at entry 0
      controller.uiMenu = {};
      controller.uiMenu.entries = [{
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      }];
      $scope.index = 0;
      controller.menuEntry = controller.uiMenu.entries[$scope.index];
      controller.selectedTimeout = angular.copy(controller.timeoutActions[0]);
      controller.timeoutInvalidChanged();
      expect(controller.uiMenu.entries[0].attempts).toEqual(1);
    });

    it('should write Repeat-Menu-Once (Timeout/Invalid action) to the model', function () {
      // phone menu at entry 0
      controller.uiMenu = {};
      controller.uiMenu.entries = [{
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      }];
      $scope.index = 0;
      controller.menuEntry = controller.uiMenu.entries[$scope.index];
      controller.selectedTimeout = angular.copy(controller.timeoutActions[1]);
      controller.selectedTimeout.childOptions = angular.copy(controller.repeatOptions);
      controller.selectedTimeout.selectedChild = angular.copy(controller.repeatOptions[0]);

      controller.timeoutInvalidChanged();
      expect(controller.uiMenu.entries[0].attempts).toEqual(2);
    });

    it('should write Repeat-Menu-Five-Times (Timeout/Invalid action) to the model', function () {
      // phone menu at entry 0
      controller.uiMenu = {};
      controller.uiMenu.entries = [{
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      }];
      $scope.index = 0;
      controller.menuEntry = controller.uiMenu.entries[$scope.index];
      controller.selectedTimeout = angular.copy(controller.timeoutActions[1]);
      controller.selectedTimeout.childOptions = angular.copy(controller.repeatOptions);
      controller.selectedTimeout.selectedChild = angular.copy(controller.repeatOptions[4]);

      controller.timeoutInvalidChanged();
      expect(controller.uiMenu.entries[0].attempts).toEqual(6);
    });

  });

});
