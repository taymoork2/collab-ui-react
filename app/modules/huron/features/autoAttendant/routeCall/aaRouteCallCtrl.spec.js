'use strict';

describe('Controller: AARouteCallMenuCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;
  var aaUiModel = {
    openHours: {}
  };

  var sortedOptions = [{
    "label": 'autoAttendant.phoneMenuRouteAA',
  }, {
    "label": 'autoAttendant.phoneMenuRouteHunt',
  }, {
    "label": 'autoAttendant.phoneMenuRouteToExtNum',
  }, {
    "label": 'autoAttendant.phoneMenuRouteUser',
  }, {
    "label": 'autoAttendant.phoneMenuRouteVM',
  }];
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($controller, _$rootScope_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = 'openHours';
    $scope.index = '0';
    aaUiModel['openHours'].addEntryAt($scope.index, AutoAttendantCeMenuModelService.newCeMenuEntry());

    controller = $controller('AARouteCallMenuCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  afterEach(function () {

  });

  describe('setSelects', function () {

    it('should add a new keyAction object into selectedActions array', function () {
      controller.menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
      controller.menuEntry.actions = [];

      var i, action;

      for (i = 0; i < controller.options.length; i++) {

        action = AutoAttendantCeMenuModelService.newCeActionEntry(controller.options[i].value, '');

        controller.menuEntry.actions[0] = action;

        controller.setSelects();
        expect(controller.selected.label).toEqual(controller.options[i].label);

      }

    });

  });

  /**
   * Lable value is not read from properties file in unit test cases. it will treat the key provided into vm.options for label
   * as text only. Sorting is based on the key itself and not on values of title.
   */
  describe('Activate ', function () {
    it('test for sorted options', function () {

      for (var i = 0; i < sortedOptions.length; i++) {
        expect(controller.options[i].label).toEqual(sortedOptions[i].label);
      }

    });
  });

});
