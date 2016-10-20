'use strict';

describe('Controller: AABuilderLaneCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $timeout;

  var aaUiModel = {
    openHours: {}
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $timeout = _$timeout_;

    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    $scope.schedule = 'openHours';
    controller = $controller('AABuilderLaneCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  describe('addAction', function () {
    it('add a new menu entry into the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      controller.addAction(-1);
      $timeout.flush();
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);

      controller.addAction(0);
      $timeout.flush();
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
    });
  });

  describe('addAction', function () {
    it('insert a new menu entry into the menu model', function () {
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
      controller.addAction(-1);
      $timeout.flush();
      expect(aaUiModel['openHours']['entries'].length).toEqual(1);
      aaUiModel['openHours']['entries'][0].setKey('0');

      controller.addAction(0);
      $timeout.flush();
      expect(aaUiModel['openHours']['entries'].length).toEqual(2);
      aaUiModel['openHours']['entries'][1].setKey('1');

      controller.addAction(0);
      $timeout.flush();
      expect(aaUiModel['openHours']['entries'].length).toEqual(3);
      expect(aaUiModel['openHours']['entries'][0].getKey()).toEqual('0');
      expect(aaUiModel['openHours']['entries'][1].getKey()).toEqual('');
      expect(aaUiModel['openHours']['entries'][2].getKey()).toEqual('1');
    });
  });

});
