'use strict';

describe('Controller: AARouteToSipEndpointCtrl', function () {
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

  describe('aaRouteToSip', function () {

    it('should be able to create new key entry', function () {
      var controller = $controller('AARouteToSipEndpointCtrl', {
        $scope: $scope
      });

      expect(controller).toBeDefined();
      expect(controller.menuKeyEntry.actions[0].name).toEqual('routeToSipEndpoint');
      expect(controller.menuKeyEntry.actions[0].value).toEqual('');

    });

    describe('activate', function () {
      it('should read and display an existing entry', function () {

        var sipInput = 'sip:shwegupt@go.webex.com';

        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('routeToSipEndpoint', sipInput);

        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });

        $scope.$apply();

        expect(controller.model.sipInput).toEqual(sipInput);
      });
    });

    describe('updateUiModel', function () {
      var sipInput, controller;
      beforeEach(function () {
        sipInput = 'sip:shwegupt@go.webex.com';
        controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });
        controller.aaRouteToSipForm = {
          $valid: true
        };
        controller.model.sipInput = sipInput;
      });

      it('should write UI entry back into UI model', function () {
        controller.updateUiModel();
        $scope.$apply();
        expect(controller.menuKeyEntry.actions[0].value).toEqual(sipInput);
      });

      it('should write UI entry back into UI model when SIP number changes', function () {
        controller.updateUiModel();
        $scope.$apply();

        var sipInputChanged = 'sip:shwegupt_changed@go.webex.com';
        controller.model.sipInput = sipInputChanged;
        controller.updateUiModel();
        $scope.$apply();

        expect(controller.menuKeyEntry.actions[0].value).toEqual('sip:shwegupt_changed@go.webex.com');
      });
    });

    describe('fromRouteCall', function () {
      beforeEach(function () {
        $scope.fromRouteCall = true;

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        aaUiModel[schedule].entries[0].actions = [];
      });

      it('should write SIP number back into Ui Model from Route Call', function () {
        var sipInput = 'sip:shwegupt@go.webex.com';
        var controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });
        controller.aaRouteToSipForm = {
          $valid: true
        };
        controller.model.sipInput = sipInput;

        controller.menuEntry.actions = [];
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToSipEndpoint', 'fobar');
        controller.menuEntry.actions = [];
        controller.menuEntry.actions[0] = action;
        controller.updateUiModel();
        $scope.$apply();

        expect(controller.menuEntry.actions[0].value).toEqual("sip:shwegupt@go.webex.com");
      });

      it('should be able to create new AA entry from Route Call', function () {

        var controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('routeToSipEndpoint');
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

        var controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('routeToSipEndpoint');
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

        var controller = $controller('AARouteToSipEndpointCtrl', {
          $scope: $scope
        });

        var fallbackAction = _.get(controller.menuEntry, 'actions[0].queueSettings.fallback.actions[0]');
        $scope.$apply();
        expect(fallbackAction).toBeDefined();
        expect(fallbackAction.name).toEqual('routeToSipEndpoint');
        expect(fallbackAction.value).toEqual('');
      });
    });
  });
});
