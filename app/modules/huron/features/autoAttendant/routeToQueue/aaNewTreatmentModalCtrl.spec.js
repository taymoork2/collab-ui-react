'use strict';

describe('Controller: AANewTreatmentModalCtrl', function () {
  var $scope;
  var $controller, controller;
  var AACommonService;
  var AutoAttendantCeMenuModelService;

  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };
  var VALUE = "value";
  var DEFAULT_MOH = 'musicOnHoldDefault';
  var CUSTOM_MOH = 'musicOnHoldUpload';
  var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';

  var ui = {
    openHours: {}
  };
  var uiMenu = {};
  var menuEntry = {};
  var routeToQueue = {};
  var queueSettings = {};
  var musicOnHold = 'musicOnHold';
  var initialAnnouncement = 'initialAnnouncement';
  var playAction = {};
  var iaAction = {};
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu0';
  var keyIndex = '0';
  var rtQ = 'routeToQueue';
  var play = 'play';
  var sortedOptions = [{
    "label": 'autoAttendant.destinations.Disconnect',
  }, {
    "label": 'autoAttendant.phoneMenuRouteAA',
  }, {
    "label": 'autoAttendant.phoneMenuRouteHunt',
  }, {
    "label": 'autoAttendant.phoneMenuRouteToExtNum',
  }, {
    "label": 'autoAttendant.phoneMenuRouteUser',
  }, {
    "label": 'autoAttendant.phoneMenuRouteVM'
  }];

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, _$controller_, _AACommonService_, _AutoAttendantCeMenuModelService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    AACommonService = _AACommonService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;
    $scope.keyIndex = keyIndex;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);
    musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
    initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
    playAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, '');
    iaAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, '');
    routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry(rtQ, '');
    musicOnHold.addAction(playAction);
    initialAnnouncement.addAction(iaAction);
    queueSettings.musicOnHold = musicOnHold;
    queueSettings.initialAnnouncement = initialAnnouncement;
    routeToQueue.queueSettings = queueSettings;
    menuEntry.addAction(routeToQueue);
    uiMenu.addEntryAt(index, menuEntry);

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

    it("default value of minute should be 15.", function () {
      expect(controller.maxWaitTime.index).toEqual(14);
    });

    describe('FallBack', function () {
      it('test for default option as Disconnect', function () {
        expect(controller.destinationOptions[0].name).toEqual('Disconnect');
      });
      it('test for sorted order options in dropdown', function () {
        for (var i = 1; i < sortedOptions.length; i++) {
          expect(controller.destinationOptions[i].label).toEqual(sortedOptions[i].label);
        }
      });
    });

    describe('view', function () {
      beforeEach(function () {
        routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry(rtQ, '');
        menuEntry.addAction(routeToQueue);
        routeToQueue.queueSettings = queueSettings;
      });

      describe('musicOnHold', function () {
        it('should set up appropriately according to musicOnHold format', function () {
          expect(controller.mohPlayAction.name).toEqual(play);
          expect(controller.menuEntry.actions[0].name).toEqual(rtQ);
        });

        it('should set up the radio options appropriately', function () {
          expect(controller.musicOnHold).toEqual(DEFAULT_MOH);
        });
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

  describe('uploadMohTrigger', function () {
    it('should set the musicOnHold', function () {
      controller.musicOnHold = DEFAULT_MOH;
      controller.uploadMohTrigger();
      expect(controller.musicOnHold).toEqual(CUSTOM_MOH);
    });
  });

  describe('ok', function () {
    it("ok function call results in closing the Modal.", function () {
      controller.ok();
      expect(modalFake.close).toHaveBeenCalled();
    });

    it('ok function call results in calling resolving queue settings status', function () {
      spyOn(AACommonService, 'setQueueSettingsStatus');
      controller.ok();
      expect(AACommonService.setQueueSettingsStatus).toHaveBeenCalledWith(true);
    });

    describe('functionality', function () {
      beforeEach(function () {

      });

      it('ok function call results in resetting the moh when moh is set to the default description', function () {
        controller.musicOnHold = DEFAULT_MOH;
        controller.mohPlayAction.description = VALUE;
        controller.ok();
        expect(controller.mohPlayAction.description).toEqual('');
      });

      it('ok function call results in resetting moh is set to default value', function () {
        controller.musicOnHold = DEFAULT_MOH;
        controller.mohPlayAction.value = VALUE;
        controller.ok();
        expect(controller.mohPlayAction.value).toEqual(CISCO_STD_MOH_URL);
      });

      it('ok function call doesnt result in resetting moh when moh is not set to default description', function () {
        controller.musicOnHold = CUSTOM_MOH;
        controller.mohPlayAction.description = VALUE;
        controller.ok();
        expect(controller.mohPlayAction.description).toEqual(VALUE);
      });

      it('ok function call doesnt result in resetting moh when moh is not set to default value', function () {
        controller.musicOnHold = CUSTOM_MOH;
        controller.mohPlayAction.value = VALUE;
        controller.ok();
        expect(controller.mohPlayAction.value).toEqual(VALUE);
      });
    });
  });
});
