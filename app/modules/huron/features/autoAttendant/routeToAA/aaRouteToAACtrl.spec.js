'use strict';

describe('Controller: AARouteToAACtrl', function () {
  var $controller;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService;
  var $rootScope, $scope;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2'
    }
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
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

  beforeEach(inject(function (_$controller_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

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

  describe('AARouteToAA', function () {

    describe('activate', function () {
      it('should be able to create new AA entry', function () {
        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });
        expect(controller).toBeDefined();
        expect(controller.menuEntry.actions[0].name).toEqual('goto');
        expect(controller.menuEntry.actions[0].value).toEqual('');
      });

      it('should initialize the options list', function () {
        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });
        expect(controller.options.length).toEqual(1);
        expect(controller.options[0]).toEqual("Oleg's Call Experience 1");
      });

      it('should initialize aaName', function () {
        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });
        expect(controller.aaName).toEqual('');
      });
    });

    describe('activate', function () {
      it('should read and display an existing entry', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('goto', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });
        expect(controller.aaName).toEqual("Oleg's Call Experience 1");
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });
        expect(controller.aaName).toEqual('');
        controller.aaName = "Oleg's Call Experience 1";
        controller.saveUiModel();
        expect(actionEntry.value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
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

      it('should create a conditional action with a "then" clause', function () {

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('goto');

      });

      it('should create a condition action with then clause', function () {

        aaUiModel[schedule].entries[0].actions[0] = undefined;

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('conditional');
        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('goto');

      });

      it('should change an action from routetoQueue to route', function () {

        aaUiModel[schedule].entries[index].actions[0].then = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('conditional');
        expect(controller.menuEntry.actions[0].then).toBeDefined();
        expect(controller.menuEntry.actions[0].then.name).toEqual('goto');

      });

    });

    describe('fromRouteCall', function () {
      beforeEach(function () {

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dummy', '');
        aaUiModel[schedule].entries[0].addAction(action);

      });

      it('should be able to create new AA menu entry from Route Call', function () {
        $scope.fromRouteCall = true;

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('goto');
      });
    });
    describe('fromRouteCall', function () {
      beforeEach(function () {
        $scope.fromRouteCall = true;

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

        aaUiModel[schedule].entries[0].actions = [];

      });

      it('should be able to create new AA entry from Route Call', function () {

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        expect(controller).toBeDefined();

        expect(controller.menuEntry.actions[0].name).toEqual('goto');
        expect(controller.menuEntry.actions[0].value).toEqual('');

      });
    });

    describe('PhoneMenu Queue Fallback', function () {
      it('should be able to create new AA entry from Queue Fallback of PhoneMenu', function () {

        var disconnect = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', '');
        var fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
        fallback.addAction(disconnect);
        var queueSettings = {};
        queueSettings.fallback = fallback;
        var routeToAA = AutoAttendantCeMenuModelService.newCeActionEntry('goto', 'some-queue-id');
        routeToAA.queueSettings = queueSettings;
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(routeToAA);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        $scope.fromRouteCall = true;
        $scope.fromFallback = true;

        var controller = $controller('AARouteToAACtrl', {
          $scope: $scope
        });

        var fallbackAction = _.get(controller.menuEntry, 'actions[0].queueSettings.fallback.actions[0]');
        $scope.$apply();
        expect(fallbackAction.name).toEqual('goto');
        expect(fallbackAction.value).toEqual('');
      });
    });

  });
});
