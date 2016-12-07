'use strict';

describe('Controller: AACallerInputCtrl', function () {
  var featureToggleService;
  var aaLanguageService;

  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;

  var aaUiModel = {
    openHours: {}
  };
  var inputActions = [{
    "key": "1",
    "keys": [
      "0", "1", "4", "5", "6", "7", "8", "9", "#", "*"
    ] }, {
      "key": "2",
      "keys": [
        "0", "2", "4", "5", "6", "7", "8", "9", "#", "*"
      ] }, {
        "key": "3",
        "keys": [
          "0", "3", "4", "5", "6", "7", "8", "9", "#", "*"
        ] }];

  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_, _AALanguageService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    featureToggleService = _FeatureToggleService_;
    aaLanguageService = _AALanguageService_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(featureToggleService, 'supports').and.returnValue($q.when(true));

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;

    var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();
    var action = AutoAttendantCeMenuModelService.newCeActionEntry("", "");

    menu.addAction(action);

    aaUiModel['openHours'].addEntryAt(index, menu);

    controller = $controller('AACallerInputCtrl', {
      $scope: $scope
    });

    $scope.$apply();

  }));

  afterEach(function () {

  });
  describe('add runActionsOnInput action', function () {
    it('should add runActionsOnInput action object menuEntry', function () {
      // appends a play action onto menuEntry
      expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
    });
  });

  describe('addKeyAction', function () {
    it('should add a new keyAction object into inputActions array', function () {
      var headkey = '0';
      var keys = [headkey, '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      controller.inputActions = [];
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(1);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
      expect(controller.inputActions[0].key).toEqual(headkey);

    });

    it('should add a new keyAction object into inputActions array without the key already in use', function () {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var keysWithout3 = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];
      // phone menu without a key row
      controller.inputActions = [];
      // add a new key row
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(1);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
      // select key 3
      controller.inputActions[0].key = '3';
      // add another key row and check that key 3 is not available
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(2);
      expect(controller.inputActions[1].keys.join()).toEqual(keysWithout3.join());
    });
  });

  describe('deleteKeyAction', function () {
    it('should delete an existing keyAction object from the inputActions array', function () {
      // inputActions should hold three elements entering
      var keys = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];

      controller.inputActions = angular.copy(inputActions);
      controller.deleteKeyAction(0);
      expect(controller.inputActions.length).toEqual(2);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
    });
  });

  describe('keyChanged', function () {
    it('should change the key for an existing action', function () {
      controller.inputActions = angular.copy(inputActions);
      var newKey = '4';
      controller.keyChanged(0, newKey);
      expect(controller.inputActions[0].key).toEqual(newKey);
    });
  });
  describe('voiceOption', function () {
    it('should find the voice option', function () {
      var voiceOptions = [{
        label: 'label1',
        value: 'Miss Piggy'
      }, {
        label: 'label2',
        value: 'Kermit'
      }];

      var voiceOption = {
        label: 'label1',
        value: 'Miss Piggy'
      };

      spyOn(aaLanguageService, 'getVoiceOption').and.returnValue(voiceOption);
      spyOn(aaLanguageService, 'getVoiceOptions').and.returnValue(voiceOptions);

      controller.voiceBackup = undefined;
      controller.setVoiceOptions();
      expect(controller.voiceOption.value).toEqual(voiceOption.value);
    });
    it('should not find the voice option', function () {
      var voiceOptions = [{
        label: 'label1',
        value: 'Miss Piggy'
      }, {
        label: 'label2',
        value: 'Kermit'
      }];

      var voiceOption = {
        label: 'label',
        value: 'Miss Piggy'
      };

      spyOn(aaLanguageService, 'getVoiceOption').and.returnValue(voiceOption);
      spyOn(aaLanguageService, 'getVoiceOptions').and.returnValue(voiceOptions);

      controller.voiceBackup = undefined;
      controller.setVoiceOptions();
      expect(controller.voiceOption.value).toEqual(voiceOptions[0].value);
    });
  });

});
