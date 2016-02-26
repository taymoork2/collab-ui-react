'use strict';

describe('Controller: AARouteCallMenuCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $translate;
  var aaUiModel = {
    openHours: {}
  };

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

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

});
