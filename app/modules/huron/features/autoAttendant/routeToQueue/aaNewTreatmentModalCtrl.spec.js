'use strict';

describe('Controller: AANewTreatmentModalCtrl', function () {
  var $scope;
  var $state;
  var $controller, controller;
  var AACommonService;
  var AutoAttendantCeMenuModelService;

  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  var ui = {
    openHours: {}
  };
  var uiMenu = {};
  var menuEntry = {};
  var routeToQueue = {};
  var queueSettings = {};
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu0';
  var keyIndex = '0';
  var rtQ = 'routeToQueue';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _AACommonService_, _AutoAttendantCeMenuModelService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $controller = _$controller_;
    AACommonService = _AACommonService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;
    $scope.keyIndex = keyIndex;

    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry(rtQ, '');
    routeToQueue.queueSettings = queueSettings;
    menuEntry.addAction(routeToQueue);
    uiMenu.addEntryAt(index, menuEntry);

    spyOn($state, 'go');

    controller = $controller('AANewTreatmentModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      aa_schedule: schedule,
      aa_menu_id: menuId,
      aa_index: index,
      aa_key_index: keyIndex,
    });
  }));

  afterEach(function () {

  });

  describe('activate', function () {
    it('should be defined', function () {
      expect(controller).toBeDefined();
    });

    describe('drop downs', function () {
      it("length of minutes should be 60.", function () {
        expect(controller.minutes.length).toEqual(60);
      });

      it("default value of minute should be 15.", function () {
        expect(controller.minute.index).toEqual(14);
      });
    });

  });

  describe('isSaveEnabled', function () {
    it('should return true', function () {
      spyOn(AACommonService, 'isValid').and.returnValue(true);
      var save = controller.isSaveEnabled();
      expect(save).toEqual(true);
    });

    it('should return false', function () {
      spyOn(AACommonService, 'isValid').and.returnValue(false);
      var save = controller.isSaveEnabled();
      expect(save).toEqual(false);
    });
  });

});
