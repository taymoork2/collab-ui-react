'use strict';

describe('Controller: AADialByExtCtrl', function () {
  var $controller;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService;
  var $rootScope, $scope, $translate;

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

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function raw2MenuEntry(raw) {
    var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    angular.extend(_menuEntry, raw);
    _menuEntry.actions = [];
    for (var j = 0; j < raw.actions.length; j++) {
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry();
      angular.extend(_action, raw.actions[j]);
      _menuEntry.addAction(_action);
    }
    return _menuEntry;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$controller_, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_) {
    $translate = _$translate_;
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

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  describe('AADialByExt', function () {

    describe('activate', function () {
      it('should be able to create new AA entry', function () {
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope
        });
        expect(controller).toBeDefined();
        expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
        expect(controller.menuEntry.actions[0].value).toEqual('');
      });

      it('should initialize the message attribute', function () {
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope
        });
        expect(controller.message).toEqual('');
        controller.saveUiModel(); // GW test
      });
    });

    describe('activate', function () {
      it('should read an existing entry', function () {
        var menuEntry = angular.copy(data.ceMenu);
        aaUiModel[schedule].entries[0].addEntry(menuEntry.entries[1]);

        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope
        });

        expect(controller.menuEntry).toEqual(aaUiModel[schedule].entries[0].entries[0]);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {
        var controller = $controller('AADialByExtCtrl', {
          $scope: $scope
        });
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        expect(controller.menuEntry.actions[0].value).toEqual('');
        var message = 'Enter the extension now.';
        controller.message = message;
        controller.saveUiModel();
        expect(controller.menuEntry.actions[0].value).toEqual(message);
      });
    });
  });
});
