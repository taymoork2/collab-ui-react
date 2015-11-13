'use strict';

describe('Controller: AABuilderActionsCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;
  var aaUiModel = {
    openHours: {}
  };

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    $scope.schedule = 'openHours';
    controller = $controller('AABuilderActionsCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  describe('removeAction', function () {
    it('remove a menu entry from the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);
      controller.removeAction(0);
      expect(aaUiModel['openHours']['entries'].length).toEqual(0);
    });
  });

  describe('removeAction', function () {
    it('remove a particular menu entry from the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);
      aaUiModel['openHours']['entries'][0].setKey('0');

      aaUiModel['openHours'].addEntryAt(1, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
      aaUiModel['openHours']['entries'][1].setKey('1');

      aaUiModel['openHours'].addEntryAt(1, AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(aaUiModel['openHours']['entries'].length).toEqual(3);
      expect(aaUiModel['openHours']['entries'][0].getKey()).toEqual('0');
      expect(aaUiModel['openHours']['entries'][1].getKey()).toEqual('');
      expect(aaUiModel['openHours']['entries'][2].getKey()).toEqual('1');

      controller.removeAction(1);
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
      expect(aaUiModel['openHours']['entries'][0].getKey()).toEqual('0');
      expect(aaUiModel['openHours']['entries'][1].getKey()).toEqual('1');
    });
  });

});
