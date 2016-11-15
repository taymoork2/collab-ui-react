'use strict';

describe('Controller: AANewTreatmentModalCtrl', function () {
  var $scope;
  var $controller, controller;
  var AACommonService;
  var AutoAttendantCeMenuModelService;

  var fakePeriodicMinute = [
    {
      index: 0,
      label: 0
    },
    {
      index: 3,
      label: 3
    },
    {
      index: 5,
      label: 5
    }
  ];

  var fakePeriodicSecond = [
    {
      index: 0,
      label: 0
    },
    {
      index: 6,
      label: 30,
    },
    {
      index: 5,
      label: 5
    },
    {
      index: 0,
      label: 5
    }
  ];
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
  var periodicAnnouncement = 'periodicAnnouncement';
  var fallback = 'fallback';
  var playAction = {};
  var iaAction = {};
  var paAction = {};
  var fbAction = {};
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu0';
  var keyIndex = '0';
  var rtQ = 'routeToQueue';
  var play = 'play';
  var disconnect = 'disconnect';
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
    periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
    fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
    playAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, '');
    iaAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, '');
    paAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, '');
    fbAction = AutoAttendantCeMenuModelService.newCeActionEntry(disconnect, '');
    routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry(rtQ, '');
    musicOnHold.addAction(playAction);
    initialAnnouncement.addAction(iaAction);
    periodicAnnouncement.addAction(paAction);
    fallback.addAction(fbAction);
    queueSettings.musicOnHold = musicOnHold;
    queueSettings.initialAnnouncement = initialAnnouncement;
    queueSettings.periodicAnnouncement = periodicAnnouncement;
    queueSettings.fallback = fallback;
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

    describe('Periodic Announcement', function () {
      beforeEach(function () {
      });
      it("length of periodic minutes and seconds", function () {
        expect(controller).toBeDefined();
        expect(controller.periodicMinutes.length).toEqual(6);
        expect(controller.periodicSeconds.length).toEqual(11);
      });

      it("default value of periodic minutes and seconds.", function () {
        expect(controller.periodicMinute.index).toEqual(0);
        expect(controller.periodicSecond.index).toEqual(8);
      });
      it("changedPeriodicMinValue funtion call with periodicMinute as 0", function () {
        controller.periodicMinute = fakePeriodicMinute[0];
        controller.changedPeriodicMinValue();
        expect(controller.areSecondsDisabled).toBe(true);
      });
      it("changedPeriodicMinValue function call with periodicMinute and periodicSecond as 0", function () {
        controller.periodicMinute = fakePeriodicMinute[0];
        controller.periodicSecond = fakePeriodicSecond[0];
        controller.changedPeriodicMinValue();
        expect(controller.periodicSecond).toEqual(controller.periodicSeconds[0]);
      });
      it("changedPeriodicMinValue function call with periodicMinute as 5", function () {
        controller.periodicMinute = fakePeriodicMinute[2];
        controller.changedPeriodicMinValue();
        expect(controller.periodicSecond).toEqual(controller.periodicSeconds[0]);
        expect(controller.areSecondsDisabled).toBe(false);
      });
      it("changedPeriodicSecValue function call with periodicSecond and periodicMinute as 0", function () {
        controller.periodicSecond = fakePeriodicSecond[0];
        controller.periodicMinute = fakePeriodicMinute[0];
        controller.periodicSeconds[0] = fakePeriodicSecond[0];
        controller.changedPeriodicSecValue();
        expect(controller.periodicSecond).toEqual(controller.periodicSeconds[0]);
        expect(controller.areSecondsDisabled).toBe(true);
      });
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
      it("default value of fallback Actions should be set", function () {
        expect(controller.maxWaitTime.label).toEqual(15);
        expect(controller.fallbackAction.description).toEqual('');
      });
      it(" value of maxTime shoulb be 15", function () {
        controller.saveFallback();
        expect(controller.fallbackAction.description).toEqual('fallback');
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

        it('should set moh action', function () {
          controller.musicOnHold = CUSTOM_MOH;
          controller.saveMoh();
          expect(controller.mohPlayAction.description).toEqual(CUSTOM_MOH);
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

      it('ok function call result in resetting moh when any upload is not set to default ', function () {
        controller.musicOnHold = CUSTOM_MOH;
        controller.mohPlayAction.description = VALUE;
        controller.ok();
        expect(controller.mohPlayAction.description).toEqual('');
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
