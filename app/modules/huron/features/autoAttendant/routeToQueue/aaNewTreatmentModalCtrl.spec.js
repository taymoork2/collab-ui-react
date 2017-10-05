'use strict';

describe('Controller: AANewTreatmentModalCtrl', function () {
  var $scope, $rootScope;
  var $controller, controller;
  var AACommonService;
  var AutoAttendantCeMenuModelService;
  var AAUiModelService;

  var fakePeriodicMinute = [
    {
      index: 0,
      label: 0,
    },
    {
      index: 3,
      label: 3,
    },
    {
      index: 5,
      label: 5,
    },
  ];

  var fakePeriodicSecond = [
    {
      index: 0,
      label: 0,
    },
    {
      index: 6,
      label: 30,
    },
    {
      index: 5,
      label: 5,
    },
    {
      index: 0,
      label: 5,
    },
  ];
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
  };
  var VALUE = 'value';
  var DEFAULT_MOH = 'musicOnHoldDefault';
  var CUSTOM_MOH = 'musicOnHoldUpload';
  var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';

  var ui = {
    openHours: {},
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
  var maxWaitTime = 15;
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu0';
  var keyIndex = '0';
  var rtQ = 'routeToQueue';
  var play = 'play';
  var disconnect = 'disconnect';
  var sortedOptions = [{
    label: 'autoAttendant.destinations.Disconnect',
  }, {
    label: 'autoAttendant.phoneMenuRouteAA',
  }, {
    label: 'autoAttendant.phoneMenuRouteHunt',
  }, {
    label: 'autoAttendant.phoneMenuRouteToExtNum',
  }, {
    label: 'autoAttendant.phoneMenuRouteUser',
  }, {
    label: 'autoAttendant.phoneMenuRouteVM',
  }];

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _AACommonService_, _AutoAttendantCeMenuModelService_, _AAUiModelService_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    AACommonService = _AACommonService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;
    $scope.keyIndex = keyIndex;
    $scope.fromRouteCall = false;
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
    queueSettings.maxWaitTime = maxWaitTime;
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
      aa_from_route_call: false,
      aa_from_decision: false,
    });
  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    $controller = null;
    AACommonService = null;
    AutoAttendantCeMenuModelService = null;
    AAUiModelService = null;
    uiMenu = null;
    menuEntry = null;
    musicOnHold = null;
    initialAnnouncement = null;
    periodicAnnouncement = null;
    fallback = null;
    playAction = null;
    iaAction = null;
    paAction = null;
    fbAction = null;
    routeToQueue = null;
  });

  describe('activate', function () {
    it('should be defined', function () {
      expect(controller).toBeDefined();
    });

    it('default value of minute should be 15.', function () {
      expect(controller.maxWaitTime).toEqual(15);
    });

    describe('Periodic Announcement', function () {
      beforeEach(function () {
      });
      it('length of periodic minutes and seconds', function () {
        expect(controller).toBeDefined();
        expect(controller.periodicMinutes.length).toEqual(6);
        expect(controller.periodicSeconds.length).toEqual(11);
      });

      it('changedPeriodicMinValue funtion call with periodicMinute as 0', function () {
        controller.periodicMinute = fakePeriodicMinute[0];
        controller.changedPeriodicMinValue();
        expect(controller.isDisabled()).toBe(false);
      });
      it('changedPeriodicMinValue function call with periodicMinute and periodicSecond as 0', function () {
        controller.periodicMinute = fakePeriodicMinute[0];
        controller.periodicSecond = fakePeriodicSecond[0];
        controller.changedPeriodicMinValue();
        expect(controller.periodicSecond.label).toEqual(controller.periodicSeconds[0]);
      });
      it('changedPeriodicMinValue function call with periodicMinute as 5', function () {
        controller.periodicMinute = 5;
        controller.changedPeriodicMinValue();
        expect(controller.isDisabled()).toBe(true);
      });

      it('start up periodicMinValue should not allow 0 minutes 0 seconds', function () {
        expect(controller.periodicSeconds).not.toContain(0);
        expect(controller.periodicSeconds[0]).toEqual(5);
      });

      it('changed periodicMinValue should adjust changes', function () {
        controller.periodicMinute = 1;
        controller.changedPeriodicMinValue();
        expect(controller.periodicSeconds[0]).toEqual(0);
        expect(controller.periodicSeconds.length).toEqual(12);
      });
    });

    describe('FallBack', function () {
      it('test for default option as Disconnect', function () {
        var fallbackAction = controller.menuEntry.actions[0].queueSettings.fallback.actions[0];
        expect(fallbackAction.name).toEqual('disconnect');
      });
      it('test for sorted order options in dropdown', function () {
        for (var i = 1; i < sortedOptions.length; i++) {
          expect(controller.destinationOptions[i].label).toEqual(sortedOptions[i].label);
        }
      });
      it('default value of fallback Actions should be set', function () {
        expect(controller.maxWaitTime).toEqual(15);
        var fallbackAction = controller.menuEntry.actions[0].queueSettings.fallback.actions[0];
        var fallbackActionDescription = fallbackAction.getDescription();
        expect(fallbackActionDescription).toEqual('');
      });
      it('value of maxTime should be 15', function () {
        controller.ok();
        var maxWaitTime = controller.menuEntry.actions[0].queueSettings.maxWaitTime;
        expect(maxWaitTime).toEqual(15);
      });

      it('should verify the disconnect action is applied after an update', function () {
        expect(controller.menuEntry.actions[0].queueSettings.fallback.actions[0].name).toEqual('disconnect');
        controller.destination.action = 'goto';
        controller.menuEntry.actions[0].queueSettings.fallback.actions[0] = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
        controller.ok();
        expect(controller.menuEntry.actions[0].queueSettings.fallback.actions[0].name).not.toBe('disconnect');
        controller.destination.action = 'disconnect';
        controller.ok();
        expect(controller.menuEntry.actions[0].queueSettings.fallback.actions[0].name).toEqual('disconnect');
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
          var mohPlayAction = controller.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
          expect(mohPlayAction.name).toEqual(play);
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

  describe('languageAndVoiceOptions', function () {
    it('when landed from Phone Menu, showLanguageAndVoiceOptions should be false', function () {
      var controller = $controller('AANewTreatmentModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        aa_schedule: schedule,
        aa_menu_id: menuId,
        aa_index: index,
        aa_key_index: keyIndex,
        aa_from_route_call: false,
        aa_from_decision: false,
      });

      $scope.$apply();

      expect(controller.showLanguageAndVoiceOptions).toBe(false);
    });

    it('when landed from New Step, showLanguageAndVoiceOptions should be true', function () {
      $scope.keyIndex = null;
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);

      var controller = $controller('AANewTreatmentModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        aa_schedule: schedule,
        aa_menu_id: menuId,
        aa_index: index,
        aa_key_index: keyIndex,
        aa_from_route_call: true,
        aa_from_decision: false,
      });

      $scope.$apply();

      expect(controller.showLanguageAndVoiceOptions).toBe(true);
    });

    it('when showLanguageAndVoiceOptions is true updateLanguageVoice should be called', function () {
      $scope.keyIndex = null;
      spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);

      var controller = $controller('AANewTreatmentModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        aa_schedule: schedule,
        aa_menu_id: menuId,
        aa_index: index,
        aa_key_index: keyIndex,
        aa_from_route_call: true,
        aa_from_decision: false,
      });

      controller.languageOption.value = 'de_DE';
      controller.voiceOption.value = 'Anna';

      controller.ok();
      $scope.$apply();

      var queueSettings = _.get(controller.menuEntry, 'actions[0].queueSettings');
      expect(angular.equals(queueSettings.language, 'de_DE')).toBe(true);
      expect(angular.equals(queueSettings.voice, 'Anna')).toBe(true);
    });
  });

  describe('populatePeriodicTime', function () {
    it('seconds should be disabled when periodicMinute is 5 mins', function () {
      var controller = $controller('AANewTreatmentModalCtrl', {
        $scope: $scope,
        $modalInstance: modalFake,
        aa_schedule: schedule,
        aa_menu_id: menuId,
        aa_index: index,
        aa_key_index: keyIndex,
        aa_from_route_call: false,
        aa_from_decision: false,
      });


      var paAction = controller.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0];
      paAction.interval = '300';
      $scope.$apply();

      expect(controller.isDisabled()).toBe(false);
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
    it('ok function call results in closing the Modal.', function () {
      controller.ok();
      expect(modalFake.close).toHaveBeenCalled();
    });

    it('ok function call results in calling resolving queue settings status', function () {
      spyOn(AACommonService, 'setQueueSettingsStatus');
      spyOn($rootScope, '$broadcast');
      controller.ok();
      expect(AACommonService.setQueueSettingsStatus).toHaveBeenCalledWith(true);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('AASaveQueueSettings');
    });

    describe('functionality', function () {
      beforeEach(function () {

      });

      it('ok function call results in resetting the moh when moh is set to the default description', function () {
        controller.musicOnHold = DEFAULT_MOH;
        var mohPlayAction = controller.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
        mohPlayAction.setDescription(VALUE);
        controller.ok();
        expect(mohPlayAction.description).toEqual('');
      });

      it('ok function call results in resetting moh is set to default value', function () {
        controller.musicOnHold = DEFAULT_MOH;
        var mohPlayAction = controller.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
        mohPlayAction.setDescription(VALUE);
        controller.ok();
        expect(mohPlayAction.value).toEqual(CISCO_STD_MOH_URL);
      });

      it('ok function call result in resetting moh when any upload is not set to default ', function () {
        controller.musicOnHold = CUSTOM_MOH;
        var mohPlayAction = controller.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
        mohPlayAction.setDescription(VALUE);
        controller.ok();
        expect(mohPlayAction.description).toEqual('');
      });

      it('ok function call doesnt result in resetting moh when moh is not set to default value', function () {
        controller.musicOnHold = CUSTOM_MOH;
        var mohPlayAction = controller.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
        mohPlayAction.setValue(VALUE);
        controller.ok();
        expect(mohPlayAction.value).toEqual(VALUE);
      });
    });
  });
  describe('cancel', function () {
    it('cancel function call results in dismissing the Modal.', function () {
      spyOn($rootScope, '$broadcast');
      controller.cancel();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('AACancelQueueSettings');
      expect(modalFake.dismiss).toHaveBeenCalled();
    });
  });
});
