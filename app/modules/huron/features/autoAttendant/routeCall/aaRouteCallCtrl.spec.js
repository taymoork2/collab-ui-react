'use strict';

describe('Controller: AARouteCallMenuCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $translate;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function raw2MenuEntry(raw) {
    var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    angular.extend(_menuEntry, raw);
    _menuEntry.actions = [];
    for (var j = 0; j < raw.actions.length; j++) {
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry();
      angular.extend(_action, raw.actions[j]);
      _menuEntry.addAction(_action);
    }
    return _menuEntry;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $translate = _$translate_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    aaUiModel['openHours'].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

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
