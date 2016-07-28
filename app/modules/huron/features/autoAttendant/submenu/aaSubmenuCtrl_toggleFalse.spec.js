'use strict';

describe('Controller: AASubmenuCtrl', function () {
  var controller;
  var AutoAttendantCeMenuModelService, AACommonService;
  var $rootScope, $scope, $translate;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '1';
  var menuId = 'menu1';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');
  var submenuData = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');

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

  function raw2Menu(raw) {
    var _menu = AutoAttendantCeMenuModelService.newCeMenu();
    angular.extend(_menu, raw);
    _menu.headers = [];
    _menu.entries = [];
    for (var i = 0; i < raw.headers.length; i++) {
      _menu.headers[i] = raw2MenuEntry(raw.headers[i]);
    }
    for (var j = 0; j < raw.entries.length; j++) {
      if (_.has(raw.entries[j], 'headers') && _.has(raw.entries[j], 'entries')) {
        _menu.entries[j] = raw2Menu(raw.entries[j]);
      } else {
        _menu.entries[j] = raw2MenuEntry(raw.entries[j]);
      }
    }
    return _menu;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($controller, _$translate_, _$rootScope_, _AutoAttendantCeMenuModelService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $translate = _$translate_;

    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AACommonService = _AACommonService_;

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = raw2Menu(submenuData.combinedMenuWithSubmenu2);
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = menuId;

    spyOn(AACommonService, 'isRouteQueueToggle').and.returnValue(false);

    controller = $controller('AASubmenuCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  afterEach(function () {

  });

  describe('activate', function () {

    it('feature toggle false', function () {
      var count = _.findIndex(controller.keyActions, {
        "name": 'phoneMenuRouteQueue'
      });
      expect(count).toEqual(-1);
    });
  });
});
