'use strict';

describe('Controller: AARouteToExtNumCtrl', function () {
  var $controller;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService, AutoAttendantHybridCareService;
  var $rootScope, $scope;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;
  var menuId = 'menu1';

  var rawCeInfos = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');

  function raw2CeInfos(rawCeInfos) {
    var _ceInfos = [];
    for (var i = 0; i < rawCeInfos.length; i++) {
      var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
      for (var j = 0; j < rawCeInfos[i].assignedResources.length; j++) {
        var _resource = AutoAttendantCeInfoModelService.newResource();
        _resource.setId(rawCeInfos[i].assignedResources[j].id);
        _resource.setTrigger(rawCeInfos[i].assignedResources[j].trigger);
        _resource.setType(rawCeInfos[i].assignedResources[j].type);
        _resource.setNumber(rawCeInfos[i].assignedResources[j].number);
        _ceInfo.addResource(_resource);
      }
      _ceInfo.setName(rawCeInfos[i].callExperienceName);
      _ceInfo.setCeUrl(rawCeInfos[i].callExperienceURL);
      _ceInfos[i] = _ceInfo;
    }
    return _ceInfos;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _AAUiModelService_, _AutoAttendantHybridCareService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AutoAttendantHybridCareService = _AutoAttendantHybridCareService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = menuId;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaModel.ceInfos = raw2CeInfos(rawCeInfos);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  describe('AARouteToExtNum', function () {
    it('should be able to create new key entry', function () {
      var controller = $controller('AARouteToExtNumCtrl', {
        $scope: $scope,
      });

      expect(controller).toBeDefined();
      expect(controller.menuKeyEntry.actions[0].name).toEqual('route');
      expect(controller.menuKeyEntry.actions[0].value).toEqual('');
    });

    describe('activate', function () {
      it('should read and display an existing entry', function () {
        var phoneNumber = '+14084744088';

        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('route', phoneNumber);

        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        $scope.$apply();

        expect(controller.model.phoneNumberInput.phoneNumber).toEqual(phoneNumber);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        var phoneNumber = '1408 474 4088';

        controller.saveUiModel(phoneNumber);

        $scope.$apply();

        expect(controller.menuKeyEntry.actions[0].value).toEqual(phoneNumber.replace(/\D/g, ''));
      });
    });

    describe('fromDecision', function () {
      beforeEach(function () {
        $scope.fromDecision = true;

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

        aaUiModel[schedule].entries[0].actions = [];

        var action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
        aaUiModel[schedule].entries[0].actions[0] = action;
      });

      it('should conditional action with then clause', function () {
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('route');
      });

      it('should create a condition action with then clause', function () {
        aaUiModel[schedule].entries[0].actions[0] = undefined;

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry.actions[0].name).toEqual('conditional');
        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('route');
      });

      it('should change an action from routetoQueue to route', function () {
        aaUiModel[schedule].entries[index].actions[0].then = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry.actions[0].name).toEqual('conditional');
        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('route');
      });
    });

    describe('fromRouteCall', function () {
      beforeEach(function () {
        $scope.fromRouteCall = true;

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

        aaUiModel[schedule].entries[0].actions = [];
      });

      it('should write phone number back into Ui Model from Route Call', function () {
        var phoneNumber = '14084744088';

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        controller.menuEntry.actions = [];
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', 'fobar');
        controller.menuEntry.actions = [];
        controller.menuEntry.actions[0] = action;

        controller.saveUiModel(phoneNumber);

        $scope.$apply();

        expect(controller.menuEntry.actions[0].value).toEqual(phoneNumber.replace(/\D/g, ''));
      });

      it('should be able to create new AA entry from Route Call', function () {
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.menuEntry.actions[0].value).toEqual('');
      });
    });

    describe('fromRouteCall overwrite', function () {
      beforeEach(function () {
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dummy', '');

        aaUiModel[schedule].entries[0].addAction(action);
      });

      it('should be able to create new external number from Route Call', function () {
        $scope.fromRouteCall = true;

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.menuEntry.actions[0].value).toEqual('');
      });
    });

    describe('fromPhoneMenu_Queue_Fallback', function () {
      it('should be able to create new route entry from Queue Fallback of PhoneMenu', function () {
        var disconnect = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', '');
        var fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
        fallback.addAction(disconnect);
        var queueSettings = {};
        queueSettings.fallback = fallback;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', 'some-queue-id');
        routeToQueue.queueSettings = queueSettings;
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        $scope.fromRouteCall = true;
        $scope.fromFallback = true;

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });

        var fallbackAction = _.get(controller.menuEntry, 'actions[0].queueSettings.fallback.actions[0]');
        $scope.$apply();
        expect(fallbackAction.name).toEqual('route');
        expect(fallbackAction.value).toEqual('');
      });
    });

    describe('should check for both phoneNumber and extension', function () {
      beforeEach(function () {
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        $scope.fromRouteCall = true;
        spyOn(AutoAttendantHybridCareService, 'getHybridandEPTConfiguration').and.returnValue(false);
      });
      it('should have phone number type extension', function () {
        var phoneNumber = '5555';
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', phoneNumber);
        aaUiModel[schedule].entries[0].addAction(action);

        spyOn(AutoAttendantCeMenuModelService, 'checkIfEnteredValueIsPhoneNumber').and.returnValue(false);
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });
        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.model.phoneNumberInput.extension).toEqual(phoneNumber);
      });

      it('should have phone number type extension', function () {
        var phoneNumber = '+91-95343221';
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', phoneNumber);
        aaUiModel[schedule].entries[0].addAction(action);

        spyOn(AutoAttendantCeMenuModelService, 'checkIfEnteredValueIsPhoneNumber').and.returnValue(true);
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });
        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.model.phoneNumberInput.phoneNumber).toEqual(phoneNumber);
      });
    });

    describe('For Hybrid user', function () {
      it('extension should be undefined in case the user is hybrid', function () {
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        $scope.fromRouteCall = true;
        spyOn(AutoAttendantHybridCareService, 'getHybridandEPTConfiguration').and.returnValue(true);

        var phoneNumber = '+91-95343221';
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', phoneNumber);
        aaUiModel[schedule].entries[0].addAction(action);

        spyOn(AutoAttendantCeMenuModelService, 'checkIfEnteredValueIsPhoneNumber').and.returnValue(true);
        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope,
        });
        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.model.phoneNumberInput.phoneNumber).toEqual(phoneNumber);
        expect(controller.model.phoneNumberInput.extension).toEqual('');
      });
    });
  });
});
