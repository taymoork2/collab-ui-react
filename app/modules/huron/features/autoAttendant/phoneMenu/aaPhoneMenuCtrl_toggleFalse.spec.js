'use strict';

describe('Controller: AAPhoneMenuCtrl', function () {
  var controller;
  var FeatureToggleService;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $q;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';
  var attempts = 4;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($controller, _$rootScope_, _$q_, _FeatureToggleService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    FeatureToggleService = _FeatureToggleService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;

    var menu = AutoAttendantCeMenuModelService.newCeMenu();
    menu.type = 'MENU_OPTION';
    menu.attempts = attempts;
    aaUiModel['openHours'].addEntryAt(index, menu);

    controller = $controller('AAPhoneMenuCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  afterEach(function () {

  });

  /**
   * name value is not read from properties file in unit test cases. It will treat the key provided into vm.keyActions for name
   * as text only. Sorting is based on the key itself and not on values of title.
   * But Submenu and Route to Queue will be absent as we mock featuretoggle to return false;
   */
  describe('AAPhoneMenuCtrl', function () {

    it('feature toggle false', function () {
      var count = _.findIndex(controller.keyActions, {
        "name": 'phoneMenuRouteQueue'
      });
      expect(count).toEqual(-1);
    });
  });

});
