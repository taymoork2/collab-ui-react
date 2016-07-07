'use strict';

describe('Controller: AARouteToExtNumCtrl', function () {
  var $controller;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService;
  var $rootScope, $scope, $translate;

  var $q;

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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$q_, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_) {
    $translate = _$translate_;
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaModel.ceInfos = raw2CeInfos(rawCeInfos);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  describe('AARouteToExtNum', function () {

    it('should be able to create new key entry', function () {
      var controller = $controller('AARouteToExtNumCtrl', {
        $scope: $scope
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
          $scope: $scope
        });

        $scope.$apply();

        expect(controller.model.phoneNumberInput.phoneNumber).toEqual(phoneNumber);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope
        });

        var phoneNumber = '1408 474 4088';

        controller.model.phoneNumberInput.phoneNumber = phoneNumber;

        controller.saveUiModel();

        $scope.$apply();

        expect(controller.menuKeyEntry.actions[0].value).toEqual(phoneNumber.replace(/\D/g, ''));

      });

      it('should write UI entry back into UI model when phone number changes', function () {

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope
        });

        var phoneNumber1 = '+14084744088';
        var phoneNumber2 = '+1 408-474-4089';

        controller.model.phoneNumberInput.phoneNumber = phoneNumber1;
        $scope.$apply('aaRouteToExtNum.model.phoneNumberInput.phoneNumber = "' + phoneNumber1 + '"');

        controller.model.phoneNumberInput.phoneNumber = phoneNumber2;
        $scope.$apply('aaRouteToExtNum.model.phoneNumberInput.phoneNumber = "' + phoneNumber2 + '"');

        expect(controller.menuKeyEntry.actions[0].value).toEqual('+14084744089');
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
          $scope: $scope
        });

        controller.model.phoneNumberInput.phoneNumber = phoneNumber;

        controller.menuEntry.actions = [];
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('route', 'fobar');
        controller.menuEntry.actions = [];
        controller.menuEntry.actions[0] = action;

        controller.saveUiModel();

        $scope.$apply();

        expect(controller.menuEntry.actions[0].value).toEqual(phoneNumber.replace(/\D/g, ''));
      });

      it('should be able to create new AA entry from Route Call', function () {

        var controller = $controller('AARouteToExtNumCtrl', {
          $scope: $scope
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
          $scope: $scope
        });

        expect(controller.menuEntry.actions[0].name).toEqual('route');
        expect(controller.menuEntry.actions[0].value).toEqual('');

      });
    });

  });
});
