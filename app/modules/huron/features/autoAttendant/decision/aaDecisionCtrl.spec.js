'use strict';

describe('Controller: AACallerInputCtrl', function () {
  var featureToggleService;
  var aaLanguageService;
  var aaCommonService;

  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;

  var aaUiModel = {
    openHours: {}
  };

  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_, _AACommonService_) {

    $rootScope = _$rootScope_;
    $scope = $rootScope;

    schedule = 'openHours';
    index = '0';

    aaUiModel = {
      openHours: {}
    };

    featureToggleService = _FeatureToggleService_;
    aaCommonService = _AACommonService_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(featureToggleService, 'supports').and.returnValue($q.when(true));

    aaCommonService.resetFormStatus();

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

    $scope.schedule = schedule;
    $scope.index = index;

    var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

    aaUiModel['openHours'].addEntryAt(index, menu);

    controller = $controller('AADecisionCtrl', {
      $scope: $scope
    });

    $scope.$apply();

  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    featureToggleService = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    aaCommonService = null;
    controller = null;
    aaUiModel = null;
  });

  describe('add runActionsOnInput action', function () {
    it('should add runActionsOnInput action object menuEntry', function () {
      // appends a play action onto menuEntry
      expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
    });
  });

});
