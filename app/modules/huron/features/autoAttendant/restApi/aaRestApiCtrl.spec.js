'use strict';

describe('Controller: AARestApiCtrl', function () {
  var $controller, $modal;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;
  var $q;
  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };
  var modal;

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$modal_, _$q_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $modal = _$modal_;
    $q = _$q_;

    $controller = _$controller_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    modal = $q.defer();
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = 'menu1';

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  describe('openConfigureApiModal', function () {
    var controller;
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
      controller = $controller('AARestApiCtrl', {
        $scope: $scope,
      });
    });

    it('should open the Modal on Validation success', function () {
      controller.openConfigureApiModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
    });

  });
});
